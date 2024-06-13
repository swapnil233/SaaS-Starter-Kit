import SharedHead from "@/components/shared/SharedHead";
import { NextPageWithLayout } from "./page";
import HomePageLayout from "@/components/shared/layouts/HomePageLayout";
import { ErrorPage } from "@/components/error/ErrorPage";

const ServerErrorPage: NextPageWithLayout = () => {
  return (
    <>
      <SharedHead title="500" />
      <div className="w-[100vw] h-[100vh] flex items-center">
        <ErrorPage
          code={500}
          title="Server-side error occurred"
          description="Our servers could not handle your request. Don't worry, our development team was already notified. Try refreshing the page."
        />
      </div>
    </>
  );
};

export default ServerErrorPage;
ServerErrorPage.getLayout = (page) => {
  return <HomePageLayout>{page}</HomePageLayout>;
};
