import type { GetStaticProps } from "next";
import { FormEvent, useState } from "react";
import Image from "next/image";
import Head from "next/head";
import { api } from "../lib/axios";

import appPreviewImg from "../assets/app-nlw-copa-preview.png";
import logoImg from "../assets/logo.svg";
import usersAvatarExampleImg from "../assets/users-avatar-example.png";
import iconCheck from "../assets/icon-check.svg";
import iconFail from "../assets/icon-fail.svg";

interface HomeProps {
  userCount: number;
  poolCount: number;
  guessCount: number;
}

export default function Home({ userCount, poolCount, guessCount }: HomeProps) {
  const [portalVisible, setPortalVisible] = useState(false);
  const [portalMessage, setPortalMessage] = useState("");
  const [portalMessageStatus, setPortalMessageStatus] = useState<
    "success" | "error"
  >("success");
  const [code, setCode] = useState("");

  const [poolTitle, setPoolTitle] = useState("");

  async function createPool(event: FormEvent) {
    event.preventDefault();

    try {
      const response = await api.post("/pools", {
        title: poolTitle,
      });

      const { code } = response.data;
      setCode(code);

      await navigator.clipboard.writeText(code);

      setPortalMessage("Bolão criado com sucesso, o código foi copiado para a área de transferência!")
      setPortalMessageStatus("success")
      setPortalVisible(true)
      setPoolTitle("");
    } catch (error) {
      setPortalMessage("Falha ao criar um bolão, tente novamente!")
      setPortalMessageStatus("error")
      setPortalVisible(true)
    }
  }

  return (
    <>
      <Head>
        <title>NLW Copa - Crie o seu bolão!</title>
      </Head>
      <div className="px-12 max-w-[1124px] mx-auto my-20 grid gap-28 items-center lg:grid-cols-2 lg:min-h-screen">
        <main>
          <Image src={logoImg} alt="NLW Copa" quality={100} />

          <h1 className="mt-14 text-white text-5xl font-bold leading-tight">
            Crie seu próprio bolão da copa e compartilhe entre amigos!
          </h1>

          <div className="mt-10 flex items-center gap-2 ">
            <Image src={usersAvatarExampleImg} alt="" />
            <strong className="text-gray-100 text-xl">
              <span className="text-ignite-500">+{userCount}</span> pessoas já
              estão usando
            </strong>
          </div>

          <form onSubmit={createPool} className="mt-10 flex gap-2">
            <input
              className="flex-1 px-6 py-4 rounded bg-gray-800 border border-gray-600 text-sm text-gray-100"
              type="text"
              required
              placeholder="Qual nome do seu bolão?"
              value={poolTitle}
              onChange={(event) => setPoolTitle(event.target.value)}
            />
            <button
              className="bg-yellow-500 px-6 py-4 rounded text-gray-900 font-bold text-sm uppercase hover:bg-yellow-700"
              type="submit"
            >
              Criar meu bolão
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-300 leading-relaxed">
            Após criar seu bolão, você receberá um código único que poderá usar
            para convidar outras pessoas 🚀
          </p>

          <div className="mt-10 pt-10 border-t border-gray-600 flex items-center justify-between text-gray-100">
            <div className="flex items-center gap-6">
              <Image src={iconCheck} alt="" />
              <div className="flex flex-col">
                <span className="font-bold text-2xl">+{poolCount}</span>
                <span>Bolões Criados</span>
              </div>
            </div>

            <div className="w-px h-14 bg-gray-600"></div>

            <div className="flex items-center gap-6">
              <Image src={iconCheck} alt="" />
              <div className="flex flex-col">
                <span className="font-bold text-2xl">+{guessCount}</span>
                <span>Palpites enviados</span>
              </div>
            </div>
          </div>
        </main>
        <Image
          className="hidden lg:block"
          src={appPreviewImg}
          alt="Dois celulares exibindo uma prévia da aplicação móvel do NLW Copa"
          quality={100}
        />
      </div>
      {portalVisible && (
        <div className="fixed w-full h-full top-0 flex items-center justify-center">
          <div
            className="absolute z-0 w-full h-full"
            onClick={() => setPortalVisible((prevState) => !prevState)}
          ></div>
          <div className="z-10 w-96 h-96 rounded-2xl px-10 py-10 bg-gray-900 flex flex-col items-center justify-between shadow-2xl">
            <div className="w-full flex justify-end">
              <span
                className="font-bold text-white text-xl cursor-pointer"
                onClick={() => setPortalVisible((prevState) => !prevState)}
              >
                X
              </span>
            </div>
            {portalMessageStatus === "success" ? (
              <Image src={iconCheck} alt="" width={100} />
            ) : (
              <Image src={iconFail} alt="" width={100} />
            )}
            <div className="flex flex-col items-center">
              {portalMessageStatus === "success" && (
                <span className="text-white">Código: {code}</span>
              )}
              <span className="text-white font-bold mt-3 block text-center">
                {portalMessage}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async (ctx) => {
  const [poolCountResponse, guessCountResponse, usersCountResponse] =
    await Promise.all([
      api.get("/pools/count"),
      api.get("/guesses/count"),
      api.get("/users/count"),
    ]);

  return {
    props: {
      poolCount: poolCountResponse.data.count,
      guessCount: guessCountResponse.data.count,
      userCount: usersCountResponse.data.count,
    },
    revalidate: 30,
  };
};
