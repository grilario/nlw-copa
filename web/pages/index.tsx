import type { GetServerSideProps } from "next";

interface HomeProps {
  count: number
}
export default function Home(props: HomeProps) {

  return (
    <div>
      <h1>Hello NLW</h1>
      <p>{props.count}</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async (ctx) => {
  const response = await fetch("http://localhost:3333/pools/count")
  const data = await response.json()

  return {
    props: {
      count: data.count
    }
  }
}
