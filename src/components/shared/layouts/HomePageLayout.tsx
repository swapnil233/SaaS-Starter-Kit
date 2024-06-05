import { FC, ReactNode } from "react";

export interface IHomePageLayout {
  children: ReactNode;
}

const HomePageLayout: FC<IHomePageLayout> = ({ children }) => {
  return (
    <>
      <main>{children}</main>
    </>
  );
};

export default HomePageLayout;
