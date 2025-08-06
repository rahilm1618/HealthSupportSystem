
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
// import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { useUser } from '@clerk/clerk-react';
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Hospital, Doctor } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Clock } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  hospitalId: z.string({
    required_error: "Please select a hospital",
  }),
  doctorId: z.string({
    required_error: "Please select a doctor",
  }),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  reason: z.string().optional(),
});

const BookAppointment = () => {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchParams] = useSearchParams();
  const prefillHospital = searchParams.get('hospital') || undefined;
  const prefillDoctor = searchParams.get('doctor') || undefined;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hospitalId: prefillHospital,
      doctorId: prefillDoctor,
      reason: ""
    }
  });
  
  const selectedHospital = form.watch("hospitalId");
  const selectedDate = form.watch("date");
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isSignedIn) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book an appointment",
        variant: "destructive"
      });
      navigate("/sign-in");
    }
  }, [isSignedIn, navigate, toast]);

  // Fetch hospitals
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(true);
  useEffect(() => {
    setHospitalsLoading(true);
    axios.get(`http://localhost:5000/api/hospitals`)
      .then(res => setHospitals(res.data))
      .catch(() => setHospitals([]))
      .finally(() => setHospitalsLoading(false));
  }, []);

  // Fetch doctors based on selected hospital
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  useEffect(() => {
    if (!selectedHospital) return;
    setDoctorsLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/doctors/hospital/${selectedHospital}`)
      .then(res => setDoctors(res.data))
      .catch(() => setDoctors([]))
      .finally(() => setDoctorsLoading(false));
  }, [selectedHospital]);

  // Create appointment
  const [isBooking, setIsBooking] = useState(false);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setIsBooking(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/appointments`,
        {
          hospitalId: values.hospitalId,
          doctorId: values.doctorId,
          date: format(values.date, "yyyy-MM-dd"),
          time: values.time,
          reason: values.reason || "",
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress,
        }
      );
      toast({
        title: "Appointment booked",
        description: "Your appointment has been booked successfully.",
      });
      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  // Generate time slots between 9AM and 5PM
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minutes = i % 2 === 0 ? "00" : "30";
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  });

  // ...existing code...

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto px-4 py-12 rounded-xl shadow-lg bg-white">
          <Card className="shadow-none rounded-none p-0 bg-transparent">
            <CardHeader>
              <CardTitle>Book an Appointment</CardTitle>
              <CardDescription>
                Fill in the details to schedule your appointment with a doctor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="hospitalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Hospital</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a hospital" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {hospitalsLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading hospitals...
                                </SelectItem>
                              ) : hospitals && hospitals.length > 0 ? (
                                hospitals.map((hospital) => (
                                  <SelectItem key={hospital.id} value={hospital.id}>
                                    {hospital.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>
                                  No hospitals available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="doctorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Doctor</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={!selectedHospital || doctorsLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={
                                  !selectedHospital 
                                    ? "Select a hospital first" 
                                    : doctorsLoading 
                                      ? "Loading doctors..." 
                                      : "Select a doctor"
                                } />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {doctorsLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading doctors...
                                </SelectItem>
                              ) : doctors && doctors.length > 0 ? (
                                doctors.map((doctor) => (
                                  <SelectItem key={doctor.id} value={doctor.id}>
                                    {doctor.name} - {doctor.speciality}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>
                                  No doctors available at this hospital
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Appointment Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    disabled={!form.getValues("doctorId")}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                      format(field.value, "MMMM d, yyyy")
                                    ) : (
                                      <span>Select a date</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 pointer-events-auto">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => {
                                    // Disable dates in the past, weekends, and today after 5pm
                                    const now = new Date();
                                    const isToday = date.toDateString() === now.toDateString();
                                    const after5pm = now.getHours() >= 17;
                                    return (
                                      date < new Date(now.setHours(0, 0, 0, 0)) ||
                                      date.getDay() === 0 ||
                                      date.getDay() === 6 ||
                                      (isToday && after5pm)
                                    );
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Appointment Time</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={!selectedDate}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeSlots.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Visit (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief description of your symptoms or reason for appointment"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={!form.formState.isValid || isBooking}
                  >
                    {isBooking ? "Booking..." : "Book Appointment"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
