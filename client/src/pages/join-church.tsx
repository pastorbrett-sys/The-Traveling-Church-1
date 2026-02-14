import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertChurchMemberSchema, type InsertChurchMember } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CheckCircle } from "lucide-react";
import footerLogo from "@assets/TC_Logo_All_white_1766882068583.png";

export default function JoinChurch() {
  const { toast } = useToast();

  const form = useForm<InsertChurchMember>({
    resolver: zodResolver(insertChurchMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      whatsapp: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertChurchMember) => {
      await apiRequest("POST", "/api/church-members", data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome to the family!",
        description: "You've been signed up as a member of The Traveling Church.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  if (mutation.isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-[#2a2a2a] border-[#bf8e00]/30 text-center" data-testid="card-success">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="w-16 h-16 text-[#bf8e00] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to the Family!</h2>
            <p className="text-gray-400">
              You're now a member of The Traveling Church. We'll be in touch soon!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-[#2a2a2a] border-[#bf8e00]/30" data-testid="card-join">
        <CardHeader className="text-center">
          <img
            src={footerLogo}
            alt="The Traveling Church"
            className="h-14 mx-auto mb-4"
            data-testid="img-join-logo"
          />
          <CardTitle className="text-2xl text-white" data-testid="text-join-title">
            Join The Traveling Church
          </CardTitle>
          <CardDescription className="text-gray-400" data-testid="text-join-description">
            Become part of our global family. Sign up below to stay connected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
              className="space-y-4"
              data-testid="form-join"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your full name"
                        className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500"
                        data-testid="input-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">WhatsApp Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+1 234 567 8900"
                        className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500"
                        data-testid="input-whatsapp"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-[#bf8e00] hover:bg-[#a67b00] text-white font-semibold"
                disabled={mutation.isPending}
                data-testid="button-submit"
              >
                {mutation.isPending ? "Signing Up..." : "Join Now"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
