import { Button } from "@/components/ui/button";
import getServerSession from "@/utils/getServerSession";
import Image from "next/image";
import Link from "next/link";

export default async function Page() {
  const session = await getServerSession();

  return (
    <div
      className="min-h-screen bg-no-repeat bg-center bg-cover bg-fixed"
      style={{ backgroundImage: "url('/bg.svg')" }}
    >
      <div className="flex flex-col p-10">
        <section className="w-full h-[180px] md:h-[220px] lg:h-[260px] border border-white/20 flex items-center justify-center overflow-hidden">
          <Image width={1310.38} height={153.5} src={"/hero.svg"} alt="" className="size-[180rem]"/>
        </section>

        <div className="hidden lg:grid grid-cols-[1fr_2fr_1fr] border border-white/20 border-t-0">
          <div className="flex flex-col border-r border-white/20">
            <div className="flex-1 min-h-[120px] border-b border-white/20 flex items-center justify-center">
              <span className="text-white/60 text-xs tracking-widest uppercase">
                Box 1 (Size X)
              </span>
            </div>
            <div className="flex-1 min-h-[120px] border-b border-white/20 flex items-center justify-center">
              <span className="text-white/60 text-xs tracking-widest uppercase">
                Box 2 (Size X)
              </span>
            </div>
            <div className="flex-1 min-h-[120px] flex items-center justify-center">
              <span className="text-white/60 text-xs tracking-widest uppercase">
                Box 3 (Size X)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center min-h-[360px] border-r border-white/20">
            <span className="text-white/60 text-xs tracking-widest uppercase">
              Big Box (Size Y)
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex-1 min-h-[120px] border-b border-white/20 flex items-center justify-center">
              <span className="text-white/60 text-xs tracking-widest uppercase">
                Box 4 (Size X)
              </span>
            </div>
            <div className="flex-1 min-h-[120px] border-b border-white/20 flex items-center justify-center">
              <span className="text-white/60 text-xs tracking-widest uppercase">
                Box 5 (Size X)
              </span>
            </div>
            <div className="flex-1 min-h-[120px] flex items-center justify-center">
              <span className="text-white/60 text-xs tracking-widest uppercase">
                Box 6 (Size X)
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:grid lg:hidden grid-cols-[1fr_2fr] border border-white/20 border-t-0">
          <div className="flex flex-col border-r border-white/20">
            <div className="flex-1 min-h-[110px] border-b border-white/20 flex items-center justify-center">
              <span className="text-white/60 text-xs tracking-widest uppercase">
                Box 1 (Size X)
              </span>
            </div>
            <div className="flex-1 min-h-[110px] border-b border-white/20 flex items-center justify-center">
              <span className="text-white/60 text-xs tracking-widest uppercase">
                Box 5 (Size X)
              </span>
            </div>
            <div className="flex-1 min-h-[110px] flex items-center justify-center">
              <span className="text-white/60 text-xs tracking-widest uppercase">
                Box 3 (Size X)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center min-h-[330px]">
            <span className="text-white/60 text-xs tracking-widest uppercase">
              Big Box (Size Y)
            </span>
          </div>
        </div>

        <div className="flex flex-col md:hidden border border-white/20 border-t-0">
          <div className="min-h-[140px] border-b border-white/20 flex items-center justify-center">
            <span className="text-white/60 text-xs tracking-widest uppercase">
              Box 1 (Size X)
            </span>
          </div>
          <div className="min-h-[200px] border-b border-white/20 flex items-center justify-center">
            <span className="text-white/60 text-xs tracking-widest uppercase">
              Big Box (Size Y)
            </span>
          </div>
          <div className="min-h-[140px] border-b border-white/20 flex items-center justify-center">
            <span className="text-white/60 text-xs tracking-widest uppercase">
              Box 5 (Size X)
            </span>
          </div>
          <div className="min-h-[140px] flex items-center justify-center">
            <span className="text-white/60 text-xs tracking-widest uppercase">
              Box 3 (Size X)
            </span>
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
