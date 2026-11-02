import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart, Brain, Bone, Baby, Activity, Shield, ChevronRight,
  Star, Phone, Mail, MapPin, Clock, CheckCircle,
  Stethoscope, Users, Award, ArrowRight,
  Microscope, Eye, Syringe, Pill, Zap, HeartPulse,
} from "lucide-react";

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const services = [
  { icon: Heart, label: "Cardiology", desc: "Advanced heart care with cutting-edge diagnostics and treatment", color: "from-red-400 to-rose-600", bg: "bg-red-50 dark:bg-red-950/30", patients: "2.4k+" },
  { icon: Brain, label: "Neurology", desc: "Expert neurological care for brain, spine, and nervous system", color: "from-violet-400 to-purple-600", bg: "bg-violet-50 dark:bg-violet-950/30", patients: "1.8k+" },
  { icon: Bone, label: "Orthopedics", desc: "Comprehensive bone, joint, and musculoskeletal treatments", color: "from-orange-400 to-amber-600", bg: "bg-orange-50 dark:bg-orange-950/30", patients: "3.1k+" },
  { icon: Baby, label: "Pediatrics", desc: "Specialized healthcare for infants, children, and adolescents", color: "from-pink-400 to-fuchsia-600", bg: "bg-pink-50 dark:bg-pink-950/30", patients: "4.2k+" },
  { icon: Eye, label: "Ophthalmology", desc: "Complete eye care from routine exams to complex surgeries", color: "from-cyan-400 to-teal-600", bg: "bg-cyan-50 dark:bg-cyan-950/30", patients: "1.5k+" },
  { icon: Microscope, label: "Oncology", desc: "Compassionate cancer care with the latest therapies", color: "from-emerald-400 to-green-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", patients: "900+" },
  { icon: Syringe, label: "Immunology", desc: "Allergy testing, immunotherapy, and autoimmune treatment", color: "from-yellow-400 to-orange-500", bg: "bg-yellow-50 dark:bg-yellow-950/30", patients: "1.1k+" },
  { icon: HeartPulse, label: "Emergency", desc: "24/7 emergency services with rapid response teams", color: "from-red-500 to-red-700", bg: "bg-red-50 dark:bg-red-950/30", patients: "6k+" },
];

const stats = [
  { value: "15,000+", label: "Patients Served", icon: Users, color: "text-primary-600" },
  { value: "120+", label: "Expert Doctors", icon: Stethoscope, color: "text-healing-600" },
  { value: "25+", label: "Departments", icon: Activity, color: "text-purple-600" },
  { value: "99%", label: "Patient Satisfaction", icon: Star, color: "text-amber-500" },
];

const steps = [
  { num: "01", title: "Create Account", desc: "Register in minutes and set up your health profile securely", color: "bg-primary-600", shadow: "shadow-primary-200" },
  { num: "02", title: "Book Appointment", desc: "Find the right specialist and book a slot that fits your schedule", color: "bg-healing-600", shadow: "shadow-healing-200" },
  { num: "03", title: "Get Care", desc: "Meet your doctor, receive diagnosis, and follow your treatment plan", color: "bg-purple-600", shadow: "shadow-purple-200" },
];

const doctors = [
  { name: "Dr. Aisha Patel", specialty: "Cardiologist", exp: "14 yrs", rating: 4.9, color: "from-rose-400 to-pink-600", tag: "bg-rose-100 text-rose-700" },
  { name: "Dr. Marcus Cole", specialty: "Neurologist", exp: "11 yrs", rating: 4.8, color: "from-violet-400 to-purple-600", tag: "bg-violet-100 text-violet-700" },
  { name: "Dr. Priya Sharma", specialty: "Pediatrician", exp: "9 yrs", rating: 4.9, color: "from-pink-400 to-fuchsia-600", tag: "bg-pink-100 text-pink-700" },
  { name: "Dr. James Wilson", specialty: "Orthopedic Surgeon", exp: "16 yrs", rating: 4.7, color: "from-orange-400 to-amber-600", tag: "bg-orange-100 text-orange-700" },
];

const testimonials = [
  { quote: "The doctors here saved my life. The entire team was compassionate and professional throughout my treatment.", name: "Sarah K.", role: "Cardiac Patient", rating: 5 },
  { quote: "Booking appointments is so easy. My kids love coming here because the pediatric team is amazing.", name: "Michael T.", role: "Parent", rating: 5 },
  { quote: "State-of-the-art facilities with doctors who genuinely care. I wouldn't go anywhere else.", name: "Priya M.", role: "Regular Patient", rating: 5 },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">HealthCare<span className="text-primary-600">+</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-slate-400">
            <a href="#services" className="hover:text-primary-600 transition-colors">Services</a>
            <a href="#doctors" className="hover:text-primary-600 transition-colors">Doctors</a>
            <a href="#about" className="hover:text-primary-600 transition-colors">About</a>
            <a href="#contact" className="hover:text-primary-600 transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors shadow-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700 pt-20 pb-32">
        {/* decorative blobs */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-healing-400/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-violet-400/10 blur-2xl" />

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white/90 mb-6 border border-white/20">
              <Zap className="h-3 w-3 text-yellow-300" /> Trusted by 15,000+ patients across the region
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight"
          >
            Your Health,<br />
            <span className="text-yellow-300">Our Priority</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto leading-relaxed"
          >
            World-class healthcare at your fingertips. Connect with 120+ expert doctors, book appointments instantly, and manage your health journey — all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register" className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary-700 hover:bg-primary-50 transition-all shadow-lg shadow-black/20 hover:scale-105 active:scale-95">
              Book Appointment <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#services" className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 px-8 py-4 text-base font-bold text-white hover:bg-white/10 transition-all">
              Explore Services <ChevronRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* floating badges */}
          <div className="mt-16 flex flex-wrap justify-center gap-3">
            {["24/7 Emergency", "Online Consultations", "Digital Prescriptions", "Lab Reports Online", "Health Analytics"].map((badge) => (
              <span key={badge} className="rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-xs font-medium text-white/90">
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L1440 80L1440 40C1200 0 960 80 720 40C480 0 240 80 0 40L0 80Z" fill="white" className="dark:fill-slate-950" />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 bg-white dark:bg-slate-950" id="about">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map(({ value, label, icon: Icon, color }) => (
              <motion.div key={label} variants={fade} className="text-center group">
                <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 dark:bg-slate-800 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-7 w-7 ${color}`} />
                </div>
                <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{value}</p>
                <p className="mt-1 text-sm font-medium text-gray-500 dark:text-slate-400">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-20 bg-gray-50 dark:bg-slate-900" id="services">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12 text-center">
            <span className="inline-block rounded-full bg-primary-100 dark:bg-primary-900/30 px-4 py-1 text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-widest mb-3">Our Departments</span>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">World-Class <span className="text-primary-600">Medical Services</span></h2>
            <p className="mt-4 text-gray-500 dark:text-slate-400 max-w-xl mx-auto">From routine checkups to complex surgeries, our 25+ departments cover every aspect of your health needs.</p>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {services.map(({ icon: Icon, label, desc, color, bg, patients }) => (
              <motion.div
                key={label} variants={fade}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`group relative overflow-hidden rounded-2xl ${bg} p-6 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-md`}
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{label}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-gray-400 dark:text-slate-500">
                  <Users className="h-3 w-3" /> {patients} patients
                </div>
                <div className="absolute -bottom-3 -right-3 h-16 w-16 rounded-full bg-white/30 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-14 text-center">
            <span className="inline-block rounded-full bg-healing-100 dark:bg-healing-900/30 px-4 py-1 text-xs font-bold text-healing-700 dark:text-healing-400 uppercase tracking-widest mb-3">Simple Process</span>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">How It <span className="text-healing-600">Works</span></h2>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {steps.map(({ num, title, desc, color, shadow }) => (
              <motion.div key={num} variants={fade} className="relative text-center">
                <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${color} shadow-lg ${shadow} text-2xl font-black text-white`}>
                  {num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
                <p className="text-gray-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── DOCTORS ── */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-violet-700 relative overflow-hidden" id="doctors">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3)_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12 text-center">
            <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-bold text-white uppercase tracking-widest mb-3">Our Team</span>
            <h2 className="text-4xl font-extrabold text-white">Meet Our <span className="text-yellow-300">Expert Doctors</span></h2>
            <p className="mt-3 text-primary-200 max-w-xl mx-auto">Our physicians are board-certified specialists with decades of combined experience and a passion for patient care.</p>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {doctors.map(({ name, specialty, exp, rating, color, tag }) => (
              <motion.div
                key={name} variants={fade}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden group hover:bg-white/20 transition-all"
              >
                <div className={`h-36 bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <div className="h-20 w-20 rounded-full bg-white/30 flex items-center justify-center text-3xl font-black text-white">
                    {name.split(" ").map(w => w[0]).join("").slice(1)}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-white">{name}</h3>
                  <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${tag}`}>{specialty}</span>
                  <div className="mt-3 flex items-center justify-between text-xs text-white/70">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{exp} exp</span>
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-300 fill-yellow-300" />{rating}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-10 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold text-primary-700 hover:bg-primary-50 transition-all shadow-lg hover:scale-105">
              View All Doctors <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12 text-center">
            <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-900/30 px-4 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-3">Patient Stories</span>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">What Our <span className="text-amber-500">Patients Say</span></h2>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map(({ quote, name, role, rating }) => (
              <motion.div key={name} variants={fade} className="rounded-2xl bg-white dark:bg-slate-800 p-7 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-slate-300 leading-relaxed italic">"{quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{name}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES STRIP ── */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl bg-gradient-to-r from-primary-600 via-violet-600 to-healing-600 p-1 shadow-xl">
            <div className="rounded-[calc(1.5rem-4px)] bg-white dark:bg-slate-900 p-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { icon: Shield, title: "Secure & Private", desc: "HIPAA-compliant data protection for all patient records", color: "text-primary-600", bg: "bg-primary-50 dark:bg-primary-900/20" },
                  { icon: Clock, title: "24/7 Support", desc: "Round-the-clock medical assistance and emergency care", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20" },
                  { icon: Award, title: "Certified Doctors", desc: "All physicians are board-certified specialists in their fields", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
                  { icon: CheckCircle, title: "Proven Results", desc: "99% patient satisfaction rate with documented outcomes", color: "text-healing-600", bg: "bg-healing-50 dark:bg-healing-900/20" },
                ].map(({ icon: Icon, title, desc, color, bg }) => (
                  <div key={title} className="flex gap-4">
                    <div className={`flex-shrink-0 h-11 w-11 rounded-xl ${bg} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{title}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT / CTA ── */}
      <section className="py-20 bg-gray-50 dark:bg-slate-900" id="contact">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <span className="inline-block rounded-full bg-primary-100 dark:bg-primary-900/30 px-4 py-1 text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-widest mb-4">Contact Us</span>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">Ready to take charge of <span className="text-primary-600">your health?</span></h2>
              <div className="space-y-4">
                {[
                  { icon: Phone, text: "+1 (800) HEALTH-1", label: "Call Us" },
                  { icon: Mail, text: "care@healthcare-plus.com", label: "Email Us" },
                  { icon: MapPin, text: "123 Medical Center Dr, Suite 400, City, State 12345", label: "Visit Us" },
                  { icon: Clock, text: "Mon–Fri 8am–8pm | Sat 9am–5pm | Emergency 24/7", label: "Hours" },
                ].map(({ icon: Icon, text, label }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
                      <Icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase">{label}</p>
                      <p className="text-sm text-gray-700 dark:text-slate-300">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="rounded-3xl bg-gradient-to-br from-primary-600 to-violet-700 p-10 text-center text-white shadow-2xl"
            >
              <div className="mb-6 flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-white/20">
                <Pill className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-extrabold mb-3">Start Your Health Journey</h3>
              <p className="text-primary-200 mb-8 leading-relaxed">Join thousands of patients who trust HealthCare+ for their medical needs. Registration is free and takes less than 2 minutes.</p>
              <Link to="/register" className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold text-primary-700 hover:bg-primary-50 transition-all shadow-lg hover:scale-105 w-full justify-center text-base">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-4 text-xs text-primary-300">No credit card required · HIPAA compliant · Cancel anytime</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 dark:bg-slate-950 text-gray-400 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600">
                  <Stethoscope className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-white">HealthCare+</span>
              </div>
              <p className="text-xs leading-relaxed">Delivering world-class healthcare with compassion, technology, and excellence.</p>
            </div>
            {[
              { title: "Services", links: ["Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Emergency"] },
              { title: "Platform", links: ["Book Appointment", "Find Doctors", "Health Records", "AI Assistant", "Billing"] },
              { title: "Company", links: ["About Us", "Careers", "Press", "Privacy Policy", "Terms of Service"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="font-semibold text-white mb-3 text-sm">{title}</h4>
                <ul className="space-y-2">
                  {links.map(l => <li key={l}><a href="#" className="text-xs hover:text-white transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs">© 2025 HealthCare+. All rights reserved.</p>
            <p className="text-xs">Built with care for better health outcomes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
