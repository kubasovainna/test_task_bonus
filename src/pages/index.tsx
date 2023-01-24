import React, { ReactElement } from 'react';
import { Layout } from 'src/components/Layout/Layout';
import { Wrapper } from '@/components/Wrapper/Wrapper';

function Home() {
  return <Wrapper />;
}

export default Home;

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
