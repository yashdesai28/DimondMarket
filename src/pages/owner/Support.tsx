import { Mail, PhoneCall, MessageCircle, Clock, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export default function Support() {
  const supportContacts = [
    {
      title: "Email Support",
      description: "Send us an email anytime, and we'll get back to you within 24 hours.",
      value: "vatsalmangukiya9003@gmail.com",
      link: "mailto:vatsalmangukiya9003@gmail.com",
      icon: Mail,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Phone Support",
      description: "Available for urgent queries during business hours (9 AM - 7 PM IST).",
      value: "+91 98252 96591",
      link: "tel:+919825296591",
      icon: PhoneCall,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Secondary Contact",
      description: "Alternative line for support and business inquiries.",
      value: "+91 93131 00630",
      link: "tel:+919313100630",
      icon: PhoneCall,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "WhatsApp",
      description: "Chat with us for quick updates and support requests.",
      value: "Chat on WhatsApp",
      link: "https://wa.me/919825296591",
      icon: MessageCircle,
      color: "text-green-600",
      bg: "bg-green-50"
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Support & Help</h1>
        <p className="text-zinc-500 mt-2 text-lg">
          We're here to help you manage your diamond business. Reach out to us through any of the channels below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {supportContacts.map((contact) => {
          const Icon = contact.icon;
          return (
            <Card key={contact.title} className="hover:shadow-md transition-shadow border-zinc-200 overflow-hidden group">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${contact.bg} ${contact.color} transition-transform group-hover:scale-110 duration-200`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">{contact.title}</CardTitle>
                    <p className="text-zinc-500 text-sm mt-0.5">{contact.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                  <span className="font-medium text-zinc-900 truncate mr-4">
                    {contact.value}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="shrink-0 gap-2 border-zinc-200 hover:bg-white hover:shadow-sm"
                    asChild
                  >
                    <a href={contact.link} target="_blank" rel="noopener noreferrer">
                      Contact <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 p-8 bg-zinc-900 rounded-2xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">Need a custom feature?</h2>
            <p className="text-zinc-400 max-w-md">
              We're constantly improving the platform. If you have suggestions or need specific tools for your business, let us know!
            </p>
          </div>
          <Button 
            className="bg-white text-zinc-900 hover:bg-zinc-100 px-8 py-6 rounded-xl font-bold text-lg"
            asChild
          >
            <a href="mailto:vatsalmangukiya9003@gmail.com?subject=Feature Request">
              Submit Request
            </a>
          </Button>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-zinc-800 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-zinc-800 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 text-zinc-400 text-sm">
          <Clock className="h-4 w-4" />
          <span>Average response time: 2-4 hours</span>
        </div>
      </div>
    </div>
  );
}
