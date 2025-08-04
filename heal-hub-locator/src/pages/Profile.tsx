
import * as React from "react";
import { useNavigate } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { useUser, useAuth } from '@clerk/clerk-react';
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, UserIcon, LogOutIcon, ClockIcon, HospitalIcon, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  doctorId: string;
  hospitalId: string;
  userId: string;
  date: string;
  time: string;
  status: string;
  reason: string;
  doctorName: string;
  doctorSpeciality: string;
  hospitalName: string;
  createdAt: string;
}

const Profile = () => {
  const { user, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isSignedIn) {
      navigate("/sign-in");
    }
  }, [isSignedIn, navigate]);

  // Fetch user appointments
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const fetchAppointments = React.useCallback(() => {
    if (!user) return;
    setIsLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/appointments?userId=${user.id}`)
      .then(res => setAppointments(res.data))
      .catch(() => setAppointments([]))
      .finally(() => setIsLoading(false));
  }, [user]);
  React.useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Cancel appointment
  const cancelAppointment = async (id: string) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/appointments/${id}/cancel`);
      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been cancelled successfully.",
      });
      fetchAppointments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Group appointments by status
  const upcomingAppointments = appointments?.filter(
    (app) => app.status === "scheduled" && new Date(app.date) >= new Date()
  ) || [];
  
  const pastAppointments = appointments?.filter(
    (app) => app.status === "completed" || new Date(app.date) < new Date()
  ) || [];
  
  // Removed cancelled appointments tab

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-11 gap-10 rounded-xl shadow-lg bg-white">
          {/* Profile sidebar */}
          <div className="md:col-span-4 space-y-7 flex flex-col items-center justify-center">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{user.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                  </div>
                </div>
                <Separator />
                <Button onClick={() => navigate("/book-appointment")}> 
                  <CalendarIcon className="mr-2 h-4 w-4" /> Book New Appointment
                </Button>
                <Button onClick={() => signOut()}> 
                  <LogOutIcon className="mr-2 h-4 w-4" /> Logout
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Appointments */}
          <div className="md:col-span-7 flex flex-col items-center justify-center">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Your Appointments</CardTitle>
                <CardDescription>Manage your scheduled appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upcoming">
                  <TabsList className="mb-4">
                    <TabsTrigger value="upcoming">
                      Upcoming ({upcomingAppointments.length})
                    </TabsTrigger>
                    <TabsTrigger value="past">
                      Past ({pastAppointments.length})
                    </TabsTrigger>

                  </TabsList>
                  
                  <TabsContent value="upcoming">
                    {isLoading ? (
                      <div className="text-center py-8">Loading appointments...</div>
                    ) : upcomingAppointments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="mx-auto h-12 w-12 opacity-30 mb-2" />
                        <p>You don't have any upcoming appointments.</p>
                        <Button onClick={() => navigate("/book-appointment")}> 
                          Book your first appointment
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {upcomingAppointments.map((appointment) => (
                          <Card key={appointment.id}>
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <Activity className="h-5 w-5 text-primary mr-2" />
                                    <span className="font-medium">{appointment.doctorName}</span>
                                    <Badge>
                                      {appointment.doctorSpeciality}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center text-muted-foreground">
                                    <HospitalIcon className="h-4 w-4 mr-2" />
                                    {appointment.hospitalName}
                                  </div>
                                  <div className="flex items-center text-muted-foreground">
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    {format(new Date(appointment.date), "MMMM d, yyyy")}
                                    <ClockIcon className="h-4 w-4 ml-4 mr-2" />
                                    {appointment.time}
                                  </div>
                                  {appointment.reason && (
                                    <p className="text-sm mt-2">
                                      <span className="font-medium">Reason:</span> {appointment.reason}
                                    </p>
                                  )}
                                </div>
                                <div className="mt-4 md:mt-0">
                                  <Button 
                                    onClick={() => cancelAppointment(appointment.id)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="past">
                    {isLoading ? (
                      <div className="text-center py-8">Loading appointments...</div>
                    ) : pastAppointments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="mx-auto h-12 w-12 opacity-30 mb-2" />
                        <p>You don't have any past appointments.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pastAppointments.map((appointment) => (
                          <Card key={appointment.id}>
                            <CardContent className="p-4">
                              <div className="flex flex-col">
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <Activity className="h-5 w-5 text-primary mr-2" />
                                    <span className="font-medium">{appointment.doctorName}</span>
                                    <Badge>
                                      {appointment.doctorSpeciality}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center text-muted-foreground">
                                    <HospitalIcon className="h-4 w-4 mr-2" />
                                    {appointment.hospitalName}
                                  </div>
                                  <div className="flex items-center text-muted-foreground">
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    {format(new Date(appointment.date), "MMMM d, yyyy")}
                                    <ClockIcon className="h-4 w-4 ml-4 mr-2" />
                                    {appointment.time}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  


                </Tabs>
                {/* Health Articles Section */}
                <div className="mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Health Articles</CardTitle>
                      <CardDescription>Stay informed with the latest health tips and news</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <a href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Healthy Diet: Facts and Tips (WHO)</a>
                        </li>
                        <li>
                          <a href="https://www.cdc.gov/physicalactivity/basics/index.htm" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Physical Activity Basics (CDC)</a>
                        </li>
                        <li>
                          <a href="https://www.mayoclinic.org/healthy-lifestyle/stress-management/in-depth/stress-relief/art-20044456" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stress Management: Tips to Prevent Burnout (Mayo Clinic)</a>
                        </li>
                        <li>
                          <a href="https://www.nhs.uk/live-well/sleep-and-tiredness/how-to-get-to-sleep/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">How to Get to Sleep (NHS)</a>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
