import { useEffect, useState } from "react";
import {
  reactExtension,
  useApi,
  AdminBlock,
  BlockStack,
  Text,
  Image,
  Banner,
  ProgressIndicator,
  Divider,
  Link,
} from "@shopify/ui-extensions-react/admin";

const TARGET = "admin.order-details.block.render";

export default reactExtension(TARGET, () => <App />);

function App() {
  const { data } = useApi(TARGET);
  const [loading, setLoading] = useState(true);
  const [lines, setLines] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const orderId = data?.selected?.[0]?.id;
        if (!orderId) {
          setLoading(false);
          return;
        }

        const response = await fetch("shopify:admin/api/graphql.json", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query OrderColorFlexPreviews($id: ID!) {
              order(id: $id) {
                name
                lineItems(first: 50) {
                  nodes {
                    id
                    title
                    quantity
                    customAttributes {
                      key
                      value
                    }
                  }
                }
              }
            }`,
            variables: { id: orderId },
          }),
        });

        const json = await response.json();
        if (json.errors?.length) {
          setError(json.errors.map((e) => e.message).join("; "));
          return;
        }

        const nodes = json?.data?.order?.lineItems?.nodes ?? [];
        const parsed = nodes.map((node) => {
          const attrs = node.customAttributes ?? [];
          const preview = attrs.find(
            (a) =>
              a.key === "_pattern_preview" &&
              a.value &&
              /^https?:\/\//i.test(String(a.value).trim())
          );
          return {
            id: node.id,
            title: node.title,
            quantity: node.quantity,
            previewUrl: preview ? String(preview.value).trim() : null,
          };
        });

        if (!cancelled) {
          setLines(parsed);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message ?? String(e));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [data?.selected?.[0]?.id]);

  if (loading) {
    return (
      <AdminBlock heading="ColorFlex previews">
        <ProgressIndicator size="large-100" accessibilityLabel="Loading previews" />
      </AdminBlock>
    );
  }

  if (error) {
    return (
      <AdminBlock heading="ColorFlex previews">
        <Banner tone="critical" title="Could not load line items">
          <Text>{error}</Text>
        </Banner>
      </AdminBlock>
    );
  }

  const withPreviews = lines.filter((l) => l.previewUrl);
  if (withPreviews.length === 0) {
    return (
      <AdminBlock heading="ColorFlex previews">
        <Banner tone="info">
          <Text>
            No line item has property _pattern_preview with an HTTPS image URL. Set Theme settings →
            ColorFlex → thumbnail API base URL and deploy api/server.js so add-to-cart stores the
            preview URL on each line.
          </Text>
        </Banner>
      </AdminBlock>
    );
  }

  return (
    <AdminBlock heading="ColorFlex design previews">
      <BlockStack gap="base">
        {withPreviews.map((line, index) => (
          <BlockStack key={line.id} gap="small">
            {index > 0 ? <Divider /> : null}
            <Text fontWeight="bold">
              {line.title} × {line.quantity}
            </Text>
            <Image
              source={line.previewUrl}
              alt={`ColorFlex preview: ${line.title}`}
            />
            <Link href={line.previewUrl} target="_blank">
              Open image in new tab
            </Link>
          </BlockStack>
        ))}
      </BlockStack>
    </AdminBlock>
  );
}
