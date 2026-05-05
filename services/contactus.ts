import { Api_url } from "../url/url";
type ApiContact= any;
export type ContactData = {
  title: string;
  tagline: string;
  mailing_address: string;
  helpline_number: string;
  corporate_contact: string;
  email_generic: string;
  email_collaboration: string;
  email_hr: string;
  drop_us_line_text: string;
};


function toContact(item: ApiContact): ContactData {
  const title = (item.title);
  const tagline =(item.tagline);
  const mailing_address =(item.mailing_address);
  const helpline_number =(item.helpline_number);
  const corporate_contact =(item.corporate_contact);
  const email_generic =(item.email_generic);
  const email_collaboration =(item.email_collaboration);
  const email_hr =(item.email_hr);
  const drop_us_line_text =(item.drop_us_line_text)

  return {
    title,
    tagline,
    mailing_address,
    helpline_number,
    corporate_contact,
    email_generic,
    email_collaboration,
    email_hr,
    drop_us_line_text
};
}

export async function fetchContact(): Promise<ContactData[]> {
  try {
    const response = await fetch(`${Api_url}api/contact/`);
    if (!response.ok) throw new Error(`Failed to fetch categories: ${response.status}`);
    const data = await response.json();
    const items: ApiContact[] = Array.isArray(data) ? data : (data?.results ?? data?.data ?? []);
    return items.map(toContact).filter(Boolean);
  } catch (error) {
    console.warn("fetchCategories error:", error);
    return [];
  }
}