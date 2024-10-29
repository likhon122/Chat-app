import { useSelector } from "react-redux";

import MyGroup from "./MyGroup";
import MyGroupInfo from "./MyGroupInfo";

const MyGroups = () => {
  const { groupId } = useSelector((state) => state.other);
  const { editGroup } = useSelector((state) => state.other);

  

  return (
    <>
      <div className="hidden sm:block">
        <div className="grid grid-cols-[1fr_2fr]">
          <div className="border border-black ">
            <MyGroup />
          </div>
          <div className="border border-black  dark:bg-gray-900 ">
            {groupId && <MyGroupInfo groupId={groupId} />}
          </div>
        </div>
      </div>

      <div className="block sm:hidden">
        <div className="">
          {editGroup ? (
            <div className="border border-black  dark:bg-gray-900 ">
              {groupId && <MyGroupInfo groupId={groupId} />}
            </div>
          ) : (
            <div className="border border-black ">
              <MyGroup />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyGroups;
