import app from "@/lib/app";
import { footerLinks } from "@/lib/marketing/footerLinks";
import {
  Anchor,
  Container,
  Group,
  useComputedColorScheme,
} from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import classes from "./Footer.module.css";

export function Footer() {
  const computedColorScheme = useComputedColorScheme("light");

  const items = footerLinks.map((link) => (
    <Anchor
      component={Link}
      c="dimmed"
      key={link.label}
      href={link.link}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Link href="/">
          <Image
            src={
              computedColorScheme === "dark"
                ? app.logoUrl.dark
                : app.logoUrl.light
            }
            alt={app.logoUrlAlt}
            height={40}
            width={40}
          />
        </Link>
        <Group className={classes.links}>{items}</Group>
      </Container>
    </div>
  );
}
