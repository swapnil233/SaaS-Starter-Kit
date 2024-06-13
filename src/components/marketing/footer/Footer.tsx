import { Container, Group, Anchor } from "@mantine/core";
import classes from "./Footer.module.css";
import Link from "next/link";
import Image from "next/image";
import app from "@/lib/app";
import { footerLinks } from "@/lib/marketing/footerLinks";

export function Footer() {
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
            src={app.logoUrl}
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
