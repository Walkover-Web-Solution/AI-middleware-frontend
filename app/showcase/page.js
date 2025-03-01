'use client'
import Header from "@/components/Header";
import ShowcaseCard from "@/components/ShowcaseCard";
import Showcaseheading from "@/components/Showcaseheading";
import { getAllShowCase } from "@/config";
import { useState, useEffect } from "react";

function Page() {
  const [showcaseData, setShowcaseData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllShowCase();
        setShowcaseData(data?.data || []);
        setFilteredData(data?.data || []);
      } catch (error) {
        console.error(error);
        setShowcaseData([]);
        setFilteredData([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = showcaseData.filter(card => 
      card?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchQuery, showcaseData]);

  return (
    <div className="bg-black h-full w-full text-white">
      <div className="hero-bg">
        <Header />
        <Showcaseheading />
      </div>
      <div className="w-3/4 mx-auto">
        <input
          className="w-full p-6 rounded-xl border-[0.1px] border-gray-500 bg-black text-white text-xl"
          placeholder="search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 w-3/4 mx-auto mt-20 gap-10 text-black pb-10">
        {Array.isArray(filteredData) && filteredData.map((card, index) => (
          <ShowcaseCard
            key={index}
            img={card.img_url}
            heading={card.name}
            text={card.description}
            url={card.link}
          />
        ))}
      </div>
    </div>
  );
}

export default Page;
