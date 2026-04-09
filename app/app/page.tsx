import { Button } from "@/components/ui/button";
import getServerSession from "@/utils/getServerSession";
import Image from "next/image";
import Link from "next/link";
import Background from "@/components/background";

export default async function Page() {
  const session = await getServerSession();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Background />

      {/* Content */}
      <div className="flex flex-col p-10">
        <section className="w-full h-[180px] md:h-[220px] lg:h-[260px] border border-white/20 flex items-center justify-center overflow-hidden">
          <Image
            width={0}
            height={0}
            src={"/hero.svg"}
            alt=""
            className="w-full h-auto"
          />
        </section>

        <div className="hidden lg:grid grid-cols-[1fr_2fr_1fr] border text-[#878787] border-white/20 border-t-0">
          <div className="flex flex-col border-r border-white/20">
            <div className="flex-1 min-h-[120px] border-b border-white/20 flex flex-col p-5 gap-2 justify-center">
              <Image
                alt=""
                src={"/logo-grey.svg"}
                height={0}
                width={0}
                className="h-auto w-12"
              ></Image>
              <p className="text-xl font-semibold">TRACKING ENGINE</p>
              <p>
                Capture user activity in real-time across your applications with
                a lightweight, high-performance tracking engine. Monitor page
                views, sessions, and custom events with precision, all while
                maintaining full control over your data. Designed for
                developers, built to scale, and optimized for modern web
                performance.
              </p>
              <div className="w-full flex justify-end">
                {session ? (
                  <Link href={"/apps"}>
                    <Button className="bg-[#878787] rounded-none text-black cursor-pointer">
                      apps
                    </Button>
                  </Link>
                ) : (
                  <Link href={"/login"}>
                    <Button className="bg-[#878787] rounded-none text-black cursor-pointer">
                      login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="flex-1 min-h-[120px] border-b border-white/20 flex items-center justify-center"></div>
            <div className="flex-1 min-h-[120px] flex flex-col p-5 gap-2 justify-center">
              <p className="text-xl font-semibold">
                DEVELOPER-FIRST DOCUMENTATION
              </p>
              <p>
                Get up and running in minutes with clear, developer-focused
                documentation. From quickstart guides to advanced integrations,
                Vishlex provides everything you need to track events, connect
                your database, and customize your analytics pipeline. Simple to
                start, powerful to extend.
              </p>
              <div className="w-full flex justify-end">
                <Link href={"/docs"}>
                  <Button className="bg-[#878787] rounded-none text-black cursor-pointer">
                    Docs
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center  justify-center min-h-[360px] py-24 border-r border-white/20">
            <Image
              width={0}
              height={0}
              src={"/engine.svg"}
              alt=""
              className="w-8/12 h-auto"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex-1 min-h-[120px] border-b border-white/20 flex items-center justify-center"></div>
            <div className="flex-1 min-h-[120px] border-b border-white/20 flex flex-col p-5 gap-2 justify-center">
              <p className="text-xl font-semibold">PROCESS & VISUALIZE DATA</p>
              <p>
                Transform raw event data into structured, actionable insights.
                Analyze traffic, user sessions, and behavioral patterns in
                real-time through a clear and intuitive interface. Identify
                trends, understand user journeys, and make data-driven decisions
                with confidence.
              </p>
            </div>
            <div className="flex-1 min-h-[120px] flex items-center justify-center"></div>
          </div>
        </div>

        <div className="hidden md:grid lg:hidden grid-cols-[1fr_2fr] text-[#878787] border border-white/20 border-t-0">
          <div className="flex flex-col border-r border-white/20">
            <div className="flex-1 min-h-[110px] border-b border-white/20 flex flex-col p-5 gap-2 justify-center">
              <Image
                alt=""
                src={"/logo-grey.svg"}
                height={0}
                width={0}
                className="h-auto w-10"
              ></Image>
              <p className="text-lg font-semibold">TRACKING ENGINE</p>
              <p className="text-sm">
                Capture user activity in real-time across your applications with
                a lightweight, high-performance tracking engine. Monitor page
                views, sessions, and custom events with precision, all while
                maintaining full control over your data. Designed for
                developers, built to scale, and optimized for modern web
                performance.
              </p>
              <div className="w-full flex justify-end">
                {session ? (
                  <Link href={"/apps"}>
                    <Button className="bg-[#878787] rounded-none text-black cursor-pointer">
                      apps
                    </Button>
                  </Link>
                ) : (
                  <Link href={"/login"}>
                    <Button className="bg-[#878787] rounded-none text-black cursor-pointer">
                      login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="flex-1 min-h-[110px] border-b border-white/20 flex flex-col p-5 gap-2 justify-center">
              <p className="text-lg font-semibold">PROCESS & VISUALIZE DATA</p>
              <p className="text-sm">
                Transform raw event data into structured, actionable insights.
                Analyze traffic, user sessions, and behavioral patterns in
                real-time through a clear and intuitive interface. Identify
                trends, understand user journeys, and make data-driven decisions
                with confidence.
              </p>
            </div>
            <div className="flex-1 min-h-[110px] flex flex-col p-5 gap-2 justify-center">
              <p className="text-lg font-semibold">
                DEVELOPER-FIRST DOCUMENTATION
              </p>
              <p className="text-sm">
                Get up and running in minutes with clear, developer-focused
                documentation. From quickstart guides to advanced integrations,
                Vishlex provides everything you need to track events, connect
                your database, and customize your analytics pipeline. Simple to
                start, powerful to extend.
              </p>
              <div className="w-full flex justify-end">
                <Link href={"/docs"}>
                  <Button className="bg-[#878787] rounded-none text-black cursor-pointer">
                    Docs
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center min-h-[330px]">
            <Image
              width={0}
              height={0}
              src={"/engine.svg"}
              alt=""
              className="w-8/12 h-auto"
            />
          </div>
        </div>

        <div className="flex text-[#878787] flex-col md:hidden border border-white/20 border-t-0">
          <div className="min-h-[140px] border-b border-white/20 flex flex-col p-5 gap-2 justify-center">
            <Image
              alt=""
              src={"/logo-grey.svg"}
              height={0}
              width={0}
              className="h-auto w-10"
            ></Image>
            <p className="text-lg font-semibold">TRACKING ENGINE</p>
            <p className="text-sm">
              Capture user activity in real-time across your applications with a
              lightweight, high-performance tracking engine. Monitor page views,
              sessions, and custom events with precision, all while maintaining
              full control over your data. Designed for developers, built to
              scale, and optimized for modern web performance.
            </p>
            <div className="w-full flex justify-end">
                {session ? (
                  <Link href={"/apps"}>
                    <Button className="bg-[#878787] rounded-none text-black cursor-pointer">
                      apps
                    </Button>
                  </Link>
                ) : (
                  <Link href={"/login"}>
                    <Button className="bg-[#878787] rounded-none text-black cursor-pointer">
                      login
                    </Button>
                  </Link>
                )}
              </div>
          </div>
          <div className="min-h-[200px] border-b border-white/20 flex items-center justify-center">
            <Image
              width={0}
              height={0}
              src={"/engine.svg"}
              alt=""
              className="w-8/12 h-auto"
            />
          </div>
          <div className="min-h-[140px] border-b border-white/20 flex flex-col p-5 gap-2 justify-center">
            <p className="text-lg font-semibold">PROCESS & VISUALIZE DATA</p>
            <p className="text-sm">
              Transform raw event data into structured, actionable insights.
              Analyze traffic, user sessions, and behavioral patterns in
              real-time through a clear and intuitive interface. Identify
              trends, understand user journeys, and make data-driven decisions
              with confidence.
            </p>
          </div>
          <div className="min-h-[140px] flex flex-col p-5 gap-2 justify-center">
            <p className="text-lg font-semibold">
              DEVELOPER-FIRST DOCUMENTATION
            </p>
            <p className="text-sm">
              Get up and running in minutes with clear, developer-focused
              documentation. From quickstart guides to advanced integrations,
              Vishlex provides everything you need to track events, connect your
              database, and customize your analytics pipeline. Simple to start,
              powerful to extend.
            </p>
            <div className="w-full flex justify-end">
                <Link href={"/docs"}>
                  <Button className="bg-[#878787] rounded-none text-black cursor-pointer">
                    Docs
                  </Button>
                </Link>
              </div>
          </div>
        </div>

        <section className="min-h-[320px] md:min-h-[400px] border border-white/20 border-t-0 flex items-center justify-center">
          <span className="text-white/60 text-sm tracking-widest uppercase">
            Section (Size N)
          </span>
        </section>

        <footer className="min-h-[160px] md:min-h-[200px] border border-white/20 border-t-0 flex items-center justify-center">
          <span className="text-white/60 text-sm tracking-widest uppercase">
            Footer (size z)
          </span>
        </footer>
      </div>
    </div>
  );
}

// import { Button } from "@/components/ui/button";
// import getServerSession from "@/utils/getServerSession";
// import Link from "next/link";

// export default async function Page() {
//    const session = await getServerSession();

//   return (
//     <div
//       className="min-h-screen bg-no-repeat bg-center bg-cover bg-fixed"
//       style={{ backgroundImage: "url('/bg.svg')" }}
//     >
//       <div className="h-[200vh] p-10 text-white">
//         <p className="text-white">{session?.user?.name ?? ""}</p>
//        {session ? (
//          <Link href={"/apps"}>
//            <Button className="bg-white text-black cursor-pointer">apps</Button>
//          </Link>
//        ) : (
//          <Link href={"/login"}>
//            <Button className="bg-white text-black cursor-pointer">login</Button>
//          </Link>
//        )}
//       </div>
//     </div>
//   );
// }
