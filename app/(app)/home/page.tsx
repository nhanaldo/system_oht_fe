import Image from "next/image";

function Home() {

    return (
        <div className="relative h-full overflow-auto">
            <Image
                src={"/baner_thaco.jpg"}
                alt="Background Image"
                width={1600}
                height={0}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                }}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                decoding="async"

            />
            <div id="center" className="m-auto w-10 h-10" />
        </div>
    );
};

export default Home;
