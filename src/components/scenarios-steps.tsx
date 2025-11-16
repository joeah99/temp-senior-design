const ScenariosSteps = ({ section, isActive, onClick}: { section: string, isActive?: boolean, onClick?: () => void}) => {
  return (
    <button onClick={onClick} className="relative flex items-center w-full cursor-pointer hover:bg-gray-50 rounded transition-colors">
        <div className="flex items-center space-x-3 px-4 rounded transition-colors">
          <div className={`absolute left-0 h-[1.5rem] w-[3px] ${isActive ? "bg-dpa-dark-green" : "bg-dpa-light-gray"}`}></div>
          <span className={`font-medium ${isActive ? "text-dpa-dark-green" : "text-dpa-dark-gray"}`}>{section}</span>
        </div>
    </button>
  );
};

export default ScenariosSteps;
