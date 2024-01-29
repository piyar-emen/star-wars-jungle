import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { useQuery, gql } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay, faDownload, faMusic } from '@fortawesome/free-solid-svg-icons';
import * as FileSaver from 'file-saver';
import XLSX from 'sheetjs-style';

function App() {
  const musicPlayer = useRef<HTMLAudioElement>(null);
  const [people, setPeople] = useState<any>([]);

  interface Filter {
    type: string;
    display: string;
  }
  const [filters, setFilters] = useState<Filter[]>([
    { "type": "id", "display": "id" },
    { "type": "__typename", "display": "type" },
    { "type": "name", "display": "Name" },
    { "type": "birthYear", "display": "Birthday" },
    { "type": "eyeColor", "display": "Eye Color" },
    { "type": "gender", "display": "Gender" },
    { "type": "hairColor", "display": "Hair Color" },
    { "type": "skinColor", "display": "Skin Color" },
    { "type": "height", "display": "Height" },
  ]);
  const [filtersWithoutId, setFiltersWithoutId] = useState<any>([]);
  const [musics, setMusics] = useState<string[]>([
    "Across the Stars (Love Theme)",
    "Anakin vs. Obi-Wan",
    "Anakins Betrayal",
    "Anakins Dark Deeds",
    "Battle of the Heroes",
    "Binary Sunset (Force Theme)",
    "Duel of the Fates", "Main Theme",
    "Reys Theme",
    "The Imperial March (Darth Vader's Theme)",
    "The Return of the Jedi",
    "The Throne Room and End Title",
    "Throne Room Theme"
  ]);
  const [currentSong, setCurrentSong] = useState<any>();
  const [musicContainerStu, setMusicContainerStu] = useState<string>("musicContainerStart");
  const [musicButtonStu, setMusicButtonStu] = useState<string>("musicButtonStart");
  const [filtersResult, setFiltersResult] = useState<any>([]);
  const [currentFilters, setCurrentFilters] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const GET_PEOPLE = gql`
  query GET_PEOPLE {
    allPeople {
      people {
        ${filters.map((filter: any) =>
    filter.type
  )}
      }
    }
  }
`;

  const { loading, error, data } = useQuery(GET_PEOPLE);

  useEffect(() => {
    if (data) {
      setPeople(data.allPeople.people);
      setFiltersResult(data.allPeople.people)
    }
    setFiltersWithoutId(filters.filter((ff: any) => ff.type !== "id"));
  }, [data])

  useEffect(() => {
    const filteredResults = people.filter((person: any) =>
      Object.entries(currentFilters).every(([key, value]) =>
        !value || person[key]?.toString().toLowerCase().includes(value.toLowerCase())
      )
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedResults = filteredResults.slice(startIndex, startIndex + itemsPerPage);

    setFiltersResult(paginatedResults);
    setTotalPages(Math.ceil(filteredResults.length / itemsPerPage));
  }, [currentPage, itemsPerPage, people, currentFilters]);

  const playClick = (e: any) => {
    setCurrentSong(e.currentTarget.id);
    e.currentTarget.style.color = "#3CBFAF";
  }

  useEffect(() => {
    musicPlayer.current?.load();
    musicPlayer.current?.play();
  }, [currentSong]);

  const itemsCountChange = (e: any) => {
    setItemsPerPage(parseInt(e.currentTarget.value));
    setCurrentPage(1);
  };

  const changeMusicStu = () => {
    if (musicContainerStu === "musicContainerShow") {
      setMusicContainerStu("musicContainerHide");
      setMusicButtonStu("musicButtonHide");
    }

    else if (musicContainerStu === "musicContainerHide") {
      setMusicContainerStu("musicContainerShow");
      setMusicButtonStu("musicButtonShow");
    }

    else {
      setMusicContainerStu("musicContainerShow");
      setMusicButtonStu("musicButtonShow");
    }
  }

  const exportToExcel = () => {
    const dataForExport = filtersResult.map((item:any) => {
      const newItem = {...item, Type: item.__typename, Name: item.name, "Birth Year": item.birthYear, "Eye Color": item.eyeColor, Gender: item.gender, "Hair Color": item.hairColor, "Skin Color": item.skinColor, Height: item.height};
      delete newItem.__typename;
      delete newItem.id;
      delete newItem.name;
      delete newItem.birthYear;
      delete newItem.eyeColor;
      delete newItem.gender;
      delete newItem.hairColor;
      delete newItem.skinColor;
      delete newItem.height;
      return newItem;
    });
    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    FileSaver.saveAs(data, "Star Wars Characters" + '.xlsx');
  };

  const handleFilterChange = (filterKey: string, filterValue: string) => {
    const newFilters = { ...currentFilters, [filterKey]: filterValue };
    setCurrentFilters(newFilters);

    const filteredResults = people.filter((person: any) =>
      Object.entries(newFilters).every(([key, value]) =>
        !value || person[key]?.toString().toLowerCase().includes(value.toLowerCase())
      )
    );
    setFiltersResult(filteredResults);
  };

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  }

  const previousPage = () => {
    setCurrentPage(currentPage - 1);
  }

  return (
    <div className='w-100 bg-black vh-100'>
      <div className='d-flex justify-content-center align-items-center' style={{ width: "100%", height: "12vh", backgroundColor: "black" }}>
        <div className='w-100 h-100 d-flex justify-content-center align-items-center position-relative'>
          <img src="header_img.png" alt="header img" height="80%" />
          <button onClick={exportToExcel} className='btn position-absolute bg-black border-0' style={{ color: "#FEE123", right: "10px", top: "60%" }}>
            <FontAwesomeIcon icon={faDownload} />
          </button>
          <div className='position-absolute d-flex align-items-center' style={{ left: "5px", top: "70%", color: "#FEE123" }}>
            <span style={{ fontSize: "10px" }} className='ms-md-2'>page size</span>
            <select aria-label="select" className='bg-black ms-1' style={{ color: "#FEE123", borderColor: "#3CBFAF", fontSize: "10px" }} onChange={itemsCountChange} defaultValue={10}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>
      {
        loading ?
          <div className='main w-100 d-flex justify-content-center align-items-center' style={{ height: "80vh" }}>
            <div className="spinner-border" role="status" style={{ color: "#FEE123" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div> :
          <div className='w-100 position-relative' style={{ height: "75vh" }}>
            <div className='table-responsive h-100'>
              <table className='table table-hover table-sm position-static mb-0 px-5 bg-white'>
                <thead style={{ position: "sticky", top: "-5px", left: "0px" }}>
                  <tr>
                    {
                      filtersWithoutId.map((filter: any, index: number) =>
                        <th scope='col' key={index} style={{ backgroundColor: "#FEE123" }}>
                          <span id={filter.type}>{filter.display}</span>
                          <input type="text" className="form-control form-control-sm" placeholder="filter..." onChange={(e) => handleFilterChange(filter.type, e.target.value)} style={{ marginLeft: "-1px" }} />
                        </th>
                      )
                    }
                  </tr>
                </thead>
                <tbody className='table-group-divider'>
                  {
                    filtersResult.map((person: any, index: number) =>
                      <tr key={index}>
                        {
                          filtersWithoutId.map((fff: any, index: number) =>
                            <td style={{ backgroundColor: "#3CBFAF" }} key={index}>{typeof person[fff.type] === "string" ? person[fff.type].toLowerCase() : person[fff.type]}</td>
                          )
                        }
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>

            <div className='col-8 col-md-4 d-flex flex-column position-absolute' style={{ top: "120px", right: "15px" }}>
              <button onClick={() => changeMusicStu()} style={{ color: "#FEE123" }} className={`${musicButtonStu} bg-transparent border-0`}>
                <img src="music.png" alt="" width={40} height={40} className='mb-1' />
              </button>
              <div className={`${musicContainerStu} py-2`} style={{ height: "30vh", overflowY: "auto", backgroundColor: "black" }}>
                <div className='w-100 d-flex justify-content-center position-sticky' style={{ top: "-8px" }}>
                  <audio controls ref={musicPlayer} className={`${musicContainerStu} mx-auto w-75 border-0`} style={{ height: "30px" }}>
                    <source src={`musics/${currentSong}.mp3`} type='audio/mpeg' id='src' />
                  </audio>
                </div>
                <div>
                  {
                    musics.map((music: string, index: number) =>
                      <button key={index} onClick={playClick} id={music} className='border-0 bg-transparent d-flex gap-2 text-start mt-2 align-items-center' style={{ color: currentSong == music ? "#3CBFAF" : "#FEE123" }}>
                        <FontAwesomeIcon icon={faCirclePlay} />
                        <div id={index.toString()} style={{ color: currentSong == music ? "#3CBFAF" : "#FEE123" }}>{music.toLowerCase()}</div>
                      </button>
                    )
                  }
                </div>
              </div>
            </div>
          </div>
      }
      <div style={{ backgroundColor: "#FEE123" }} className='d-flex justify-content-center aling-items-center vw-100'>
        {currentPage > 1 && totalPages > 0 && (
          <button className='border-0 bg-transparent' style={{ fontFamily: "Arial" }} onClick={previousPage}>{`<`}</button>
        )}
        <button className='border-0 bg-transparent'>{currentPage}</button>
        {currentPage < totalPages && totalPages > 0 && (
          <button className='border-0 bg-transparent' style={{ fontFamily: "Arial" }} onClick={nextPage}>{`>`}</button>
        )}
      </div>

      <div className='footer d-flex justify-content-center align-items-center pt-2' style={{ height: "8vh", backgroundColor: "black", fontSize: "14px" }}>
        <span style={{ color: "#3CBFAF" }}>Developed by</span>
        <a href="https://www.linkedin.com/in/piyaremen/" className='ms-2' style={{ color: "#FEE123", textDecorationLine: "none" }} target='_blank'>Piyar Emen</a>
      </div>
    </div>
  );
}

export default App;