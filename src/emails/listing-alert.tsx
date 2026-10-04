import * as React from "react";
import { Body, Button, Container, Head, Html, Img, Link, Preview, Section, Text } from "@react-email/components";

type Listing = {
  address: string;
  price: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  photoUrl?: string;
  daysOnMarket?: number;
  href: string;
};

export function ListingAlertEmail({
  firstName,
  searchName,
  listings,
}: {
  firstName: string;
  searchName: string;
  listings: Listing[];
}) {
  const subjectLine = `${listings.length} new homes match your '${searchName}' search`;

  return (
    <Html>
      <Head />
      <Preview>{subjectLine}</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f6f8fb" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", margin: "24px auto" }}>
          <Img src="https://crowncoastalhomes.com/logo.png" alt="Crown Coastal Homes" width="160" />
          <Text>Hi {firstName},</Text>
          <Text>New listings alert</Text>
          <Text>{listings.length} new homes matching your search "{searchName}".</Text>

          {listings.map((listing) => (
            <Section key={listing.href} style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px", marginTop: "16px" }}>
              {listing.photoUrl ? <Img src={listing.photoUrl} alt={listing.address} width="520" /> : null}
              <Text style={{ fontWeight: 700 }}>{listing.address}</Text>
              <Text>
                ${listing.price.toLocaleString()} · {listing.beds || 0} bd · {listing.baths || 0} ba · {(listing.sqft || 0).toLocaleString()} sqft
              </Text>
              <Button href={`${listing.href}?utm_source=email&utm_campaign=listing_alert&utm_medium=email`}>View Details</Button>
            </Section>
          ))}

          <Text>
            <Link href="https://crowncoastalhomes.com/dashboard/searches">Manage alerts</Link> |{" "}
            <Link href="https://crowncoastalhomes.com/unsubscribe">Unsubscribe</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
