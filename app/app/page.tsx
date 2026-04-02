import { Button } from "@/components/ui/button";
import getServerSession from "@/utils/getServerSession";
import Link from "next/link";

const Page = async () => {
  const session = await getServerSession();

  return (
    <div className="min-h-screen w-full bg-black flex justify-center items-center flex-col gap-2.5">
      <p className="text-white">{session?.user?.name ?? ""}</p>
      {session ? (
        <Link href={"/apps"}>
          <Button className="bg-white text-black cursor-pointer">apps</Button>
        </Link>
      ) : (
        <Link href={"/auth/login"}>
          <Button className="bg-white text-black cursor-pointer">login</Button>
        </Link>
      )}
    </div>
  );
};

export default Page;
