import React, { ReactElement } from 'react';
import { Layout } from 'src/components/Layout/Layout';
import { Widget } from '@/components/Widget/Widget';

function Home() {
  return <Widget speed={70} />;
}

export default Home;

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
