"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Users, MessageCircle, Zap, Check } from "lucide-react";

/**
 * Landing page for Cartmate.
 * Shows marketing content with animations for new users.
 * Redirects authenticated users to dashboard.
 */
export default function LandingPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          // User is authenticated, redirect to dashboard
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <ShoppingCart className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    );
  }
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const features = [
    {
      icon: ShoppingCart,
      title: "Shared Lists",
      description: "Create and share shopping lists with your family and friends in real-time.",
    },
    {
      icon: Users,
      title: "Household Members",
      description: "Add your family members, roommates, or friends — everyone has a say in what goes on the list.",
    },
    {
      icon: MessageCircle,
      title: "Chat with your roomies & family",
      description: "Discuss items, coordinate shopping trips, and chat about what everyone needs.",
    },
    {
      icon: Zap,
      title: "Everyone has a say",
      description: "See updates instantly as family members add, check off, or edit items together.",
    },
  ];

  const benefits = [
    "Never forget milk again",
    "No more 3 cartons of milk",
    "Stop fighting over who bought what",
    "Shop smarter together",
    "Save time and reduce stress",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <ShoppingCart className="h-7 w-7 text-primary" />
              <span className="text-2xl font-bold tracking-tight">Cartmate</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <Button variant="ghost" onClick={() => router.push("/login")}>
                Login
              </Button>
              <Button onClick={() => router.push("/register")}>
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-primary/10 text-primary rounded-full">
              Family & Friends Shopping
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 gradient-text"
          >
            Family Shopping,
            <br />
            <span className="text-primary drop-shadow-lg">Made Fun Again</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Whether you live with family, friends, or roomies — keep everyone in sync.
            <br />
            One list, one chat, zero duplicate groceries.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button size="lg" onClick={() => router.push("/register")} className="text-lg px-8 glossy-button">
              Start Shopping Together
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/login")}
              className="text-lg px-8"
            >
              Sign In
            </Button>
          </motion.div>

          {/* Animated decoration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 blur-3xl rounded-full" />
            <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm text-muted-foreground font-mono">
                  Shopping List
                </span>
              </div>
              <div className="space-y-3 text-left">
                {["Milk", "Bread", "Eggs", "Coffee"].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-background rounded-lg"
                  >
                    <div className="h-5 w-5 rounded border-2 border-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Floating Emojis Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 floating-emoji text-6xl">🍎</div>
        <div className="absolute top-1/3 right-1/4 floating-emoji text-5xl animation-delay-1000">🥛</div>
        <div className="absolute bottom-1/3 left-1/3 floating-emoji text-4xl animation-delay-2000">🥖</div>
        <div className="absolute bottom-1/4 right-1/3 floating-emoji text-5xl animation-delay-3000">☕</div>
        <div className="absolute top-1/2 left-1/5 floating-emoji text-4xl animation-delay-4000">🍞</div>
        <div className="absolute top-2/3 right-1/5 floating-emoji text-6xl animation-delay-5000">🥚</div>
      </div>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border/40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything Your Household Needs
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed for families and friends shopping together
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow glow-card"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Families Choose Cartmate
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg"
              >
                <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border/40">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12 border border-primary/20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of teams already shopping smarter with Cartmate
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/register")}
            className="text-lg px-8"
          >
            Create Your Free Account
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="font-mono text-sm">
            &copy; 2025 Cartmate. Built for families & friends who live (and shop) together.
          </p>
        </div>
      </footer>
    </div>
  );
}

