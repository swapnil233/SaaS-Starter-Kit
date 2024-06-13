import { Container, Title, Text, Button, Group } from "@mantine/core";
import classes from "./ErrorPage.module.css";
import Link from "next/link";
import { FC } from "react";

interface IErrorPageProps {
  title: string;
  code: number;
  description: string;
}

export const ErrorPage: FC<IErrorPageProps> = ({
  title,
  code,
  description,
}) => {
  return (
    <Container className={classes.root}>
      <div className={classes.inner}>
        <div className={classes.content}>
          <Title className={classes.title}>{`${code} - ${title}`}</Title>
          <Text
            c="dimmed"
            size="lg"
            ta="center"
            className={classes.description}
          >
            {description}
          </Text>
          <Group justify="center">
            <Button component={Link} href="/" size="md">
              Take me back to home page
            </Button>
          </Group>
        </div>
      </div>
    </Container>
  );
};
