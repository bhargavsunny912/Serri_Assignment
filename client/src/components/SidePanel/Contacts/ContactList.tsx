import type { TContact } from 'librechat-data-provider';
import ContactCard from './ContactCard';

interface ContactListProps {
  contacts: TContact[];
}

export default function ContactList({ contacts }: ContactListProps) {
  if (contacts.length === 0) {
    return <div className="text-center p-4 text-sm text-text-secondary">No contacts found.</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {contacts.map(c => (
         <ContactCard key={c._id} contact={c} />
      ))}
    </div>
  );
}
