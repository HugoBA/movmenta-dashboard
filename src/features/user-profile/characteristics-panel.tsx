import { Cake, Footprints, Mail, Phone, Ruler, User, VenusAndMars, Weight } from "lucide-react";
import { Panel } from "@/components/layout/panel";
import type { UserProfileRecord } from "@/lib/xano/user-profiles";

function Char({
  icon,
  label,
  value,
  full = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : undefined}>
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-text-faint uppercase">
        <span className="[&_svg]:size-2.5 [&_svg]:opacity-70">{icon}</span>
        {label}
      </div>
      <div className="text-[13px] font-semibold break-words">{value}</div>
    </div>
  );
}

export function CharacteristicsPanel({ profile }: { profile: UserProfileRecord }) {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "—";

  return (
    <Panel title="Characteristics" subtitle="User profile">
      <div className="grid grid-cols-2 gap-x-3.5 gap-y-4">
        <Char icon={<User />} label="Name" value={name} full />
        <Char icon={<Mail />} label="Email" value={profile.email || "—"} full />
        <Char icon={<Phone />} label="Phone" value={profile.phone || "—"} full />
        <Char icon={<Cake />} label="Age" value={profile.age ? `${profile.age} years` : "—"} />
        <Char icon={<VenusAndMars />} label="Gender" value={profile.gender || "—"} />
        <Char icon={<Weight />} label="Weight" value={profile.weight ? `${profile.weight} kg` : "—"} />
        <Char icon={<Ruler />} label="Height" value={profile.height ? `${profile.height} cm` : "—"} />
        <Char icon={<Footprints />} label="Shoe size" value={profile.shoeSize ? String(profile.shoeSize) : "—"} />
      </div>
    </Panel>
  );
}
