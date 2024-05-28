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
          rowHeaders: true,
          colHeaders: true,
          contextMenu: true,
          manualColumnResize: true,
          manualRowResize: true,
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
          rowHeaders: true,
          colHeaders: true,
          contextMenu: true,
          manualColumnResize: true,
          manualRowResize: true,
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

  const addColumn = () => {
    hotInstance.current.alter('insert_col', hotInstance.current.countCols());
    updateTableData();
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
      className={`flex h-screen ${isTableFullScreen || isJsonFullScreen ? 'flex-col' : 'flex-col md:flex-row'} p-4 overflow-hidden`}
    >
      {!isJsonFullScreen && (
        <motion.div
          layout
          className={
            isTableFullScreen ? FullScreen : `relative w-full md:w-1/2 p-4 `
          }
        >
          <div className='flex justify-between mb-4'>
            <div>
              <button
                onClick={addRow}
                className='px-4 py-2 mr-2 text-white bg-blue-500 rounded'
              >
                添加行
              </button>
              <button
                onClick={removeRow}
                className='px-4 py-2 mr-2 text-white bg-red-500 rounded'
              >
                删除行
              </button>
              <button
                onClick={addColumn}
                className='px-4 py-2 mr-2 text-white bg-green-500 rounded'
              >
                添加列
              </button>
              <button
                onClick={removeColumn}
                className='px-4 py-2 mr-2 text-white bg-yellow-500 rounded'
              >
                删除列
              </button>
            </div>
            <div>
              <button
                onClick={copyTableToClipboard}
                className='px-4 py-2 mr-2 text-white bg-gray-500 rounded'
              >
                复制 Table 数据
              </button>
              <button
                onClick={() => setIsTableFullScreen(!isTableFullScreen)}
                className='px-4 py-2 text-white bg-indigo-500 rounded'
              >
                {isTableFullScreen ? '退出全屏' : '全屏表格'}
              </button>
            </div>
          </div>
          <div
            ref={hotRef}
            className={`w-full h-[94%]  border border-gray-300 mb-4 flex overflow-auto`}
          ></div>
        </motion.div>
      )}
      {!isTableFullScreen && (
        <motion.div layout className={`relative w-full md:w-1/2 p-4`}>
          <div
            className={
              isJsonFullScreen ? FullScreen : 'flex flex-col w-full h-full'
            }
          >
            <div className=''>
              <button
                onClick={copyJsonToClipboard}
                className='px-4 py-2 mr-2 text-white bg-gray-500 rounded'
              >
                复制 JSON 数据
              </button>
              <button
                onClick={() => setIsJsonFullScreen(!isJsonFullScreen)}
                className='px-4 py-2 mb-4 text-white bg-indigo-500 rounded'
              >
                {isJsonFullScreen ? '退出全屏' : '全屏 JSON'}
              </button>
            </div>
            <textarea
              value={jsonText}
              onChange={handleJsonChange}
              className={`w-full h-[94%] p-4 pb-[50vh] border border-gray-300`}
            ></textarea>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EditableGrid;
