
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch user appointments
  const { data: appointments, isLoading, error, refetch } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/appointments`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      return response.data as Appointment[];
    },
    enabled: !!user,
  });

  // Cancel appointment
  const cancelAppointment = async (id: string) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/appointments/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      
      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been cancelled successfully.",
      });
      
      // Refetch appointments
      refetch();
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
  
  const cancelledAppointments = appointments?.filter(
    (app) => app.status === "cancelled"
  ) || [];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-12 gap-6">
          {/* Profile sidebar */}
          <div className="md:col-span-4 space-y-4">
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
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Separator />
                <Button variant="outline" className="w-full" onClick={() => navigate("/book-appointment")}>
                  <CalendarIcon className="mr-2 h-4 w-4" /> Book New Appointment
                </Button>
                <Button variant="outline" className="w-full" onClick={logout}>
                  <LogOutIcon className="mr-2 h-4 w-4" /> Logout
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Appointments */}
          <div className="md:col-span-8">
            <Card>
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
                    <TabsTrigger value="cancelled">
                      Cancelled ({cancelledAppointments.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upcoming">
                    {isLoading ? (
                      <div className="text-center py-8">Loading appointments...</div>
                    ) : upcomingAppointments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="mx-auto h-12 w-12 opacity-30 mb-2" />
                        <p>You don't have any upcoming appointments.</p>
                        <Button variant="link" onClick={() => navigate("/book-appointment")}>
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
                                    <Badge variant="outline" className="ml-2">
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
                                    variant="destructive" 
                                    size="sm"
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
                                    <Badge variant="outline" className="ml-2">
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
                  
                  <TabsContent value="cancelled">
                    {isLoading ? (
                      <div className="text-center py-8">Loading appointments...</div>
                    ) : cancelledAppointments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="mx-auto h-12 w-12 opacity-30 mb-2" />
                        <p>You don't have any cancelled appointments.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cancelledAppointments.map((appointment) => (
                          <Card key={appointment.id} className="bg-gray-50">
                            <CardContent className="p-4 opacity-70">
                              <div className="flex flex-col">
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <Activity className="h-5 w-5 text-muted-foreground mr-2" />
                                    <span className="font-medium">{appointment.doctorName}</span>
                                    <Badge variant="outline" className="ml-2">
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
                                  <Badge variant="secondary">Cancelled</Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
