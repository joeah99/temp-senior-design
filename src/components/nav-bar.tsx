import Image from "next/image";
import Link from "next/link";

const NavBar = () => {
  return (
    <header className="flex items-center py-4 px-8 bg-white shadow-sm shadow-zinc-200 fixed z-50 top-0 w-full h-20">
      <nav className="">
        <Link href="/">
          <Image src="/img/dpa-logo.jpg" alt="logo" height={0} width={95} />
        </Link>
      </nav>
    </header>
  );
};
export default NavBar;
