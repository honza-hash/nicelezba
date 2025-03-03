import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Redirect, useLocation } from "wouter";
import { SiGoogle } from "react-icons/si";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema),
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
  });

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              ai.ihos.eu
              <span className="block text-sm font-normal text-muted-foreground mt-1">
                Soukromé AI které nezbírá ani netrénuje data
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full mb-8 bg-primary/10 border-primary/20 hover:bg-primary/20"
              onClick={() => setLocation("/chat")}
            >
              Vyzkoušet bez přihlášení
              <span className="ml-2 text-xs text-muted-foreground">(70 zpráv zdarma)</span>
            </Button>

            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Přihlášení</TabsTrigger>
                <TabsTrigger value="register">Registrace</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}>
                    <div className="space-y-4">
                      <Input
                        placeholder="Uživatelské jméno"
                        {...loginForm.register("username")}
                        className="bg-black/20"
                      />
                      <Input
                        type="password"
                        placeholder="Heslo"
                        {...loginForm.register("password")}
                        className="bg-black/20"
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-primary/90 hover:bg-primary"
                        disabled={loginMutation.isPending}
                      >
                        Přihlásit se
                      </Button>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-muted" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Nebo přihlášení přes
                          </span>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                      >
                        <SiGoogle className="mr-2 h-4 w-4" />
                        Google
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))}>
                    <div className="space-y-4">
                      <Input
                        placeholder="Uživatelské jméno"
                        {...registerForm.register("username")}
                        className="bg-black/20"
                      />
                      <Input
                        type="password"
                        placeholder="Heslo"
                        {...registerForm.register("password")}
                        className="bg-black/20"
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-primary/90 hover:bg-primary"
                        disabled={registerMutation.isPending}
                      >
                        Registrovat
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div className="hidden lg:flex flex-1 items-center justify-center p-8">
        <div className="max-w-lg space-y-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
            Bezpečné a Soukromé AI
          </h1>
          <p className="text-lg text-muted-foreground">
            Chatujte s několika AI modely bez obav o vaše soukromí. Vaše data nejsou nikdy použita k trénování modelů ani sdílena s třetími stranami.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Gemini AI
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Mistral AI
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Claude 3
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              LLaMA 2
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}