import type { SVGProps } from "react";
import {
  ArrowLeft, ArrowRight, Award, Baby, BadgeIndianRupee, BatteryLow, Bell,
  Brain, Briefcase, Calendar, CalendarCheck, CalendarClock, CalendarDays,
  CalendarPlus, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  CircleAlert, CircleHelp, CircleUserRound, Clock, ClockAlert, CloudUpload,
  Eye, EyeOff, Ghost, Globe, Globe2, GraduationCap, Heart, HeartHandshake,
  HeartPulse, Image, ImagePlus, Info, Italic, KeyRound, Languages, Loader,
  Lock, LogOut, Mail, MailOpen, MailPlus, Map, MapPin, Menu, MessageCircle,
  MessageSquare, Mic, MicOff, Pencil, Phone, Plus, Rainbow, ReceiptText,
  RefreshCw, Save, Search, Settings2, Shield, ShieldCheck, Smartphone, Sparkles,
  Stethoscope, Target, Trash2, User, UserCheck, UserPlus, UserRoundCheck,
  UserRoundCog, Users, Video, Wallet, X, Zap,
} from "lucide-react";

type IconComponent = typeof Calendar;
const icons: Record<string, IconComponent> = {
  "arrow-left": ArrowLeft, "arrow-right": ArrowRight, award: Award, baby: Baby,
  "badge-indian-rupee": BadgeIndianRupee, "battery-low": BatteryLow, bell: Bell,
  brain: Brain, briefcase: Briefcase, calendar: Calendar, "calendar-check": CalendarCheck,
  "calendar-clock": CalendarClock, "calendar-days": CalendarDays, "calendar-plus": CalendarPlus,
  "check-circle": CheckCircle, "chevron-down": ChevronDown, "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight, "chevron-up": ChevronUp, "circle-alert": CircleAlert,
  "circle-help": CircleHelp,
  "circle-user-round": CircleUserRound, clock: Clock, "clock-alert": ClockAlert,
  "cloud-upload": CloudUpload, eye: Eye, "eye-off": EyeOff, ghost: Ghost, globe: Globe,
  "globe-2": Globe2, "graduation-cap": GraduationCap, heart: Heart,
  "heart-handshake": HeartHandshake, "heart-pulse": HeartPulse, image: Image,
  "image-plus": ImagePlus, info: Info, italic: Italic, "key-round": KeyRound,
  languages: Languages, loader: Loader, lock: Lock, "log-out": LogOut, mail: Mail,
  "mail-open": MailOpen, "mail-plus": MailPlus, map: Map, "map-pin": MapPin,
  menu: Menu, "message-circle": MessageCircle, "message-square": MessageSquare,
  mic: Mic, "mic-off": MicOff, pencil: Pencil, phone: Phone, plus: Plus,
  rainbow: Rainbow, "receipt-text": ReceiptText, "refresh-cw": RefreshCw,
  save: Save, search: Search, "settings-2": Settings2, shield: Shield,
  "shield-check": ShieldCheck, smartphone: Smartphone, sparkles: Sparkles,
  stethoscope: Stethoscope, target: Target, "trash-2": Trash2, user: User,
  "user-check": UserCheck, "user-plus": UserPlus, "user-round-check": UserRoundCheck,
  "user-round-cog": UserRoundCog, users: Users, video: Video, wallet: Wallet, x: X, zap: Zap,
  facebook: CircleHelp, instagram: CircleHelp, linkedin: CircleHelp, youtube: CircleHelp,
};

export function LucideIcon({ name, size = 24, strokeWidth = 2, color = "currentColor", ...props }: { name: string; size?: number; strokeWidth?: number; color?: string } & SVGProps<SVGSVGElement>) {
  const Icon = icons[name] ?? CircleHelp;
  return <Icon aria-hidden="true" focusable="false" size={size} strokeWidth={strokeWidth} color={color} {...props} />;
}
