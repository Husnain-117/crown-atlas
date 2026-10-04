import * as React from "react";
import { Body, Button, Container, Head, Html, Img, Preview, Text } from "@react-email/components";

export function PriceDropEmail({
  address,
  oldPrice,
  newPrice,
  photoUrl,
  listingUrl,
}: {
  address: string;
  oldPrice: number;
  newPrice: number;
  photoUrl?: string;
  listingUrl: string;
}) {
  const reduction = oldPrice - newPrice;
  const percent = oldPrice > 0 ? Math.round((reduction / oldPrice) * 100) : 0;

  return (
    <Html>
      <Head />
      <Preview>{`Price reduced on a home you saved - ${address} is now $${newPrice.toLocaleString()}`}</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f6f8fb" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", margin: "24px auto" }}>
          <Text style={{ fontSize: "18px", fontWeight: 700 }}>Price Drop Alert</Text>
          <Text>{address}</Text>
          {photoUrl ? <Img src={photoUrl} alt={address} width="520" /> : null}
          <Text>
            Was <strong>${oldPrice.toLocaleString()}</strong>
          </Text>
          <Text>
            Now <strong>${newPrice.toLocaleString()}</strong>
          </Text>
          <Text>
            Reduced by ${reduction.toLocaleString()} ({percent}%)
          </Text>
          <Button href={listingUrl}>Schedule a tour</Button>
        </Container>
      </Body>
    </Html>
  );
}
