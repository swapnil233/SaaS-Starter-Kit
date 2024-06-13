import SharedHead from "@/components/shared/SharedHead";
import { NextPageWithLayout } from "./page";
import HomePageLayout from "@/components/shared/layouts/HomePageLayout";
import { ErrorPage } from "@/components/error/ErrorPage";

const NotFoundPage: NextPageWithLayout = () => {
  return (
    <>
      <SharedHead title="404" />
      <div className="w-[100vw] h-[100vh] flex items-center">
        <ErrorPage
          code={404}
          title="Not found"
          description="The page you're looking for doesn't exist"
        />
      </div>
    </>
  );
};

export default NotFoundPage;
NotFoundPage.getLayout = (page) => {
  return <HomePageLayout>{page}</HomePageLayout>;
};
