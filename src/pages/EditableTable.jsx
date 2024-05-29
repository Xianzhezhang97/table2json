import React, { useRef, useEffect, useState } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import 'tailwindcss/tailwind.css';
import { motion } from 'framer-motion';

const EditableGrid = () => {
  const hotRef = useRef(null);
  const hotInstance = useRef(null);
  const [selected, setSelected] = useState({ row: null, col: null });
  const [tableData, setTableData] = useState([]);
  const [jsonText, setJsonText] = useState('');
  const [isJsonFullScreen, setIsJsonFullScreen] = useState(false);
  const [isTableFullScreen, setIsTableFullScreen] = useState(false);
  const FullScreen = 'fixed top-8 left-8 right-8 bottom-8 z-50';
  const ButtonStyle = 'rounded-full px-8 py-2 mr-2 text-white ';

  const initialSpreadsheetData = Handsontable.helper.createSpreadsheetData(
    4,
    4,
  );

  useEffect(() => {
    const savedData = localStorage.getItem('handsontableData');
    let initialData;
    if (savedData) {
      initialData = JSON.parse(savedData);
      const header = Object.keys(initialData[0]);
      const dataArray = [header, ...initialData.map(Object.values)];
      setJsonText(JSON.stringify(initialData, null, 2));
      if (!isJsonFullScreen && !isTableFullScreen && !hotInstance.current) {
        hotInstance.current = new Handsontable(hotRef.current, {
          data: dataArray,
          licenseKey: 'non-commercial-and-evaluation',
          height: 'auto',
          width: 'auto',
          rowHeaders: true,
          colHeaders: [
            'ID',
            'Full name',
            'Position',
            'Country',
            'City',
            'Address',
            'Zip code',
            'Mobile',
            'E-mail',
          ],
          fixedRowsStart: 1,
          colHeaders: true,
          contextMenu: true,
          manualColumnResize: true,
          manualRowResize: true,
          dropdownMenu: true,
          afterChange: function (changes, source) {
            if (source !== 'loadData') {
              updateTableData();
            }
          },
          afterSelectionEnd: (r1, c1, r2, c2) => {
            setSelected({ row: r1, col: c1 });
          },
        });
        updateTableData();
      }
    } else {
      initialData = Handsontable.helper.createSpreadsheetData(4, 4);
      setJsonText(
        JSON.stringify(
          initialData.slice(1).map((row) => {
            let obj = {};
            row.forEach((cell, i) => {
              obj[initialData[0][i]] = cell;
            });
            return obj;
          }),
          null,
          2,
        ),
      );
      if (!isJsonFullScreen && !isTableFullScreen && !hotInstance.current) {
        hotInstance.current = new Handsontable(hotRef.current, {
          data: initialData,
          licenseKey: 'non-commercial-and-evaluation',
          fixedRowsTop: 1,
          colHeaders: data[0],
          colHeaders: true,
          fixedRowsTop: 1,
          contextMenu: true,
          manualColumnResize: true,
          manualRowResize: true,
          dropdownMenu: true,
          width: 'auto',
          height: 'auto',
          autoWrapRow: true,
          autoWrapCol: true,

          afterChange: function (changes, source) {
            if (source !== 'loadData') {
              updateTableData();
            }
          },
          afterSelectionEnd: (r1, c1, r2, c2) => {
            setSelected({ row: r1, col: c1 });
          },
        });
        updateTableData();
      }
    }

    return () => {
      if (hotInstance.current && (isJsonFullScreen || isTableFullScreen)) {
        hotInstance.current.destroy();
        hotInstance.current = null;
      }
    };
  }, [isJsonFullScreen, isTableFullScreen]);

  const updateTableData = () => {
    const data = hotInstance.current.getData();
    const keys = data[0];
    const jsonData = data.slice(1).map((row) => {
      let obj = {};
      row.forEach((cell, i) => {
        obj[keys[i]] = cell;
      });
      return obj;
    });
    setTableData(jsonData);
    setJsonText(JSON.stringify(jsonData, null, 2));
    localStorage.setItem('handsontableData', JSON.stringify(jsonData));
  };

  const addRow = () => {
    hotInstance.current.alter('insert_row', hotInstance.current.countRows());
    updateTableData();
  };

  const removeRow = () => {
    if (selected.row !== null) {
      hotInstance.current.alter('remove_row', selected.row);
      updateTableData();
    }
  };
  const resetData = () => {
    const initialData = initialSpreadsheetData;
    hotInstance.current.loadData(initialData);
    setJsonText(
      JSON.stringify(
        initialData.slice(1).map((row) => {
          let obj = {};
          row.forEach((cell, i) => {
            obj[initialData[0][i]] = cell;
          });
          return obj;
        }),
        null,
        2,
      ),
    );
    localStorage.removeItem('handsontableData');
  };

  const removeColumn = () => {
    if (selected.col !== null) {
      hotInstance.current.alter('remove_col', selected.col);
      updateTableData();
    }
  };

  const handleJsonChange = (e) => {
    const newJsonText = e.target.value;
    setJsonText(newJsonText);
    try {
      const newData = JSON.parse(newJsonText);
      const newDataArray = [
        Object.keys(newData[0]),
        ...newData.map(Object.values),
      ];
      if (hotInstance.current) {
        hotInstance.current.loadData(newDataArray);
        setTableData(newData);
      }
    } catch (error) {
      console.error('Invalid JSON format');
    }
  };

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(jsonText);
    alert('JSON data copied to clipboard!');
  };

  const copyTableToClipboard = () => {
    if (hotInstance.current) {
      const data = hotInstance.current.getData();
      const dataString = data.map((row) => row.join('\t')).join('\n');
      navigator.clipboard.writeText(dataString).then(() => {
        alert('Table data copied to clipboard!');
      });
    }
  };

  return (
    <div
      className={`flex h-screen ${isTableFullScreen || isJsonFullScreen ? '' : 'flex-col md:flex-row'} rounded-[28px] p-4 overflow-hidden`}
    >
      {!isJsonFullScreen && (
        <motion.div
          layout
          className={
            isTableFullScreen ? FullScreen : `relative w-full md:w-1/2 p-4`
          }
        >
          <motion.div layout className='flex justify-between mb-8'>
            <div>
              <a href='http://xianzhe.site'>
                <button className={ButtonStyle + 'bg-blue-500'}>
                  返回主页
                </button>
              </a>
              <button
                onClick={resetData}
                className={ButtonStyle + 'bg-red-500'}
              >
                清空全部
              </button>
              <button
                onClick={removeRow}
                className={ButtonStyle + 'bg-green-500'}
              >
                删除行
              </button>
              <button
                onClick={removeColumn}
                className={ButtonStyle + 'bg-yellow-500'}
              >
                删除列
              </button>
            </div>
            <div>
              <button
                onClick={copyTableToClipboard}
                className={ButtonStyle + 'bg-gray-500'}
              >
                复制 Table 数据
              </button>
              <button
                onClick={() => setIsTableFullScreen(!isTableFullScreen)}
                className={ButtonStyle + 'bg-indigo-500'}
              >
                {isTableFullScreen ? '退出全屏' : '全屏表格'}
              </button>
            </div>
          </motion.div>
          <motion.div
            className='w-full h-[90%] rounded-[28px] overflow-auto border border-gray-300 focus:border-blue-500'
            layout
          >
            <div
              ref={hotRef}
              className={`w-full h-full  mb-4 scrollbar-hide  overflow-hidden`}
            ></div>
          </motion.div>
        </motion.div>
      )}
      {!isTableFullScreen && (
        <motion.div layout className={`flex relative w-full md:w-1/2 p-4 `}>
          <motion.div
            layout
            className={
              isJsonFullScreen ? FullScreen : 'flex flex-col w-full h-full '
            }
          >
            <div className='mb-8 gap-x-8'>
              <button
                onClick={copyJsonToClipboard}
                className={ButtonStyle + 'bg-gray-500'}
              >
                复制 JSON 数据
              </button>
              <button
                onClick={() => setIsJsonFullScreen(!isJsonFullScreen)}
                className={ButtonStyle + 'bg-indigo-500'}
              >
                {isJsonFullScreen ? '退出全屏' : '全屏 JSON'}
              </button>
            </div>
            <div className='rounded-[28px] overflow-hidden w-full h-[90%]'>
              <textarea
                value={jsonText}
                onChange={handleJsonChange}
                className={`w-full h-full p-[28px] pb-[50vh] z-0 rounded-[28px] overflow-auto border border-gray-300`}
              ></textarea>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default EditableGrid;
