import { Html, Body, Container, Section, Text, Button, Hr, Head, Preview } from '@react-email/components';
import { propertyUrlFor } from '@/lib/property-url';

interface Listing {
  id: string;
  address: string;
  city: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  photos: string[];
}

interface SearchAlertEmailProps {
  listings: Listing[];
  searchLabel: string;
  unsubscribeUrl: string;
}

export default function SearchAlertEmail({ 
  listings, 
  searchLabel, 
  unsubscribeUrl 
}: SearchAlertEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {`${listings.length} new home${listings.length > 1 ? 's' : ''} match your search`}
      </Preview>
      <Body style={{ fontFamily: 'Arial, sans-serif', background: '#F5F5F5', padding: '20px 0' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
          {/* Header */}
          <Section style={{ background: '#1B3A5C', padding: '24px 32px' }}>
            <Text style={{ color: '#C9A84C', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
              Crown Coastal Homes
            </Text>
            <Text style={{ color: '#ffffff', fontSize: '14px', margin: '4px 0 0' }}>
              New listings for: {searchLabel}
            </Text>
          </Section>

          {/* Listings */}
          {listings.slice(0, 5).map((listing) => (
            <Section key={listing.id} style={{ padding: '20px 32px', borderBottom: '1px solid #eee' }}>
              <Text style={{ fontWeight: 'bold', fontSize: '16px', margin: '0 0 4px', color: '#1B3A5C' }}>
                {listing.address}
              </Text>
              <Text style={{ color: '#444', fontSize: '14px', margin: '0 0 12px' }}>
                ${listing.price.toLocaleString()} · {listing.beds} bd · {listing.baths} ba · {listing.sqft.toLocaleString()} sqft
              </Text>
              <Button 
                href={propertyUrlFor({ listing_key: listing.id, address: listing.address, city: listing.city })}
                style={{ 
                  background: '#1B3A5C', 
                  color: '#fff',
                  padding: '10px 20px', 
                  borderRadius: '6px', 
                  fontSize: '14px',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                View Listing →
              </Button>
            </Section>
          ))}

          {/* View All Button */}
          {listings.length > 5 && (
            <Section style={{ padding: '20px 32px', textAlign: 'center', background: '#f9f9f9' }}>
              <Text style={{ fontSize: '14px', color: '#666', margin: '0 0 12px' }}>
                + {listings.length - 5} more listing{listings.length - 5 > 1 ? 's' : ''}
              </Text>
              <Button 
                href="https://crowncoastalhomes.com/properties"
                style={{ 
                  background: '#C9A84C', 
                  color: '#1B3A5C',
                  padding: '10px 24px', 
                  borderRadius: '6px', 
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                View All Matches
              </Button>
            </Section>
          )}

          <Hr style={{ margin: '0', borderColor: '#eee' }} />

          {/* Footer */}
          <Section style={{ padding: '16px 32px', background: '#f9f9f9' }}>
            <Text style={{ fontSize: '12px', color: '#999', margin: '0 0 8px' }}>
              You are receiving this because you saved a search on crowncoastalhomes.com.
            </Text>
            <Text style={{ fontSize: '12px', margin: 0 }}>
              <a href={unsubscribeUrl} style={{ color: '#1A6FAD', textDecoration: 'underline' }}>
                Unsubscribe from this alert
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
