import { NumberOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import React, { useMemo, useState } from 'react';
import { useMaterialsData } from '../../hooks/useMaterialsData';
import type { IBatch, IGroupedMaterial, IMaterialConsumption, IProductionOrder } from '../../types/productionOrderTypes';
import Table from '../Table';
import MaterialDetailModal from './MaterialDetailModal';
import { getMaterialsTableColumns } from './MaterialsTableColumns';


interface MaterialsTabProps {
  order: IProductionOrder;
  batches: IBatch[];
  batchFilter?: string | null;
  onClearFilter?: () => void;
  onChangeBatchFilter?: (code: string | null) => void;
}

const MaterialsTab: React.FC<MaterialsTabProps> = ({
  order,
  batches,
  batchFilter,
  onClearFilter,
  onChangeBatchFilter
}) => {
  if (!order) return null;

  // 1. Logic & Data (Custom Hook)
  const {
    loading,
    ingredientsTotals,
    selectedBatchCode,
    setSelectedBatchCode,
    filterType,
    setFilterType,
    ingredientSearch,
    setIngredientSearch,
    lotSearch,
    setLotSearch,
    setActiveIngredientSearch,
    setActiveLotSearch,
    filteredData,
    allMaterials
  } = useMaterialsData(order, batches, batchFilter, onChangeBatchFilter);

  // 2. UI State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<IGroupedMaterial | null>(null);
  const [selectedItem, setSelectedItem] = useState<IMaterialConsumption | null>(null);

  // 3. Table Columns Configuration
  const columns = useMemo(() => getMaterialsTableColumns({
    onView: (record) => {
      setSelectedGroup(record);
      setIsModalOpen(true);
    }
  }), []);

  return (
    <div className="space-y-6 pt-4 pb-10">
      {/* Batch Filter Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-[#5b4ce8] rounded-full"></div>
              <label className="text-sm font-bold text-gray-800 uppercase tracking-tight">Số Lô (Batch Number)</label>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#d4edda] border border-[#c3e6cb]"></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Đã tiêu thụ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#fff3cd] border border-[#ffeaa7]"></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Chưa tiêu thụ</span>
              </div>
            </div>
          </div>
          <div className="p-1 max-h-[160px] overflow-y-auto custom-scrollbar">
            <div className="flex flex-wrap gap-2">
              <div
                onClick={() => setSelectedBatchCode(null)}
                className={`px-4 py-1.5 rounded-full border cursor-pointer text-xs font-bold transition-all duration-200 ${(selectedBatchCode === null || selectedBatchCode === undefined)
                  ? 'bg-[#5b4ce8] border-[#5b4ce8] text-white shadow-lg scale-105'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-[#5b4ce8] hover:text-[#5b4ce8]'
                  }`}
              >
                Tất cả
              </div>
              {allMaterials.some(m => (!m.batchCode || m.batchCode.trim() === "") && m.id) && (
                <div
                  onClick={() => {
                    setSelectedBatchCode("");
                    const hasConsumption = allMaterials.some(m => (!m.batchCode || m.batchCode.trim() === "") && (m.quantity as any) > 0);
                    setFilterType(hasConsumption ? 'consumed' : 'unconsumed');
                  }}
                  className={`px-4 py-1.5 rounded-full border cursor-pointer text-xs font-bold transition-all duration-200 ${selectedBatchCode === ""
                    ? 'bg-[#5b4ce8] border-[#5b4ce8] text-white shadow-lg scale-105'
                    : 'bg-green-50 border-green-200 text-green-700 hover:border-green-400'
                    }`}
                >
                  Vật tư không Batch
                </div>
              )}
              {batches.filter(batch => batch.batchNumber).map((batch) => {
                const batchNumNormalized = batch.batchNumber.trim().toUpperCase();
                const isSelected = (selectedBatchCode || '').trim().toUpperCase() === batchNumNormalized;
                const hasConsumption = allMaterials.some(m => (m.batchCode || '').trim().toUpperCase() === batchNumNormalized && (m.quantity as any) > 0);
                return (
                  <div
                    key={batch.batchNumber}
                    onClick={() => {
                      setSelectedBatchCode(batchNumNormalized);
                      setFilterType(hasConsumption ? 'consumed' : 'unconsumed');
                    }}
                    className={`px-4 py-1.5 rounded-full border cursor-pointer text-xs font-bold transition-all duration-200 ${isSelected ? 'bg-[#5b4ce8] border-[#5b4ce8] text-white shadow-lg scale-105' :
                      (hasConsumption ? 'bg-[#d4edda] border-[#c3e6cb] text-[#155724] hover:border-[#a1d6ad]' : 'bg-[#fff3cd] border-[#ffeaa7] text-[#856404] hover:border-[#ffdb9a]')
                      }`}
                  >
                    {batch.batchNumber.trim()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status Filter Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-[#5b4ce8] rounded-full"></div>
            <label className="text-sm font-bold text-gray-800 uppercase tracking-tight">Trạng Thái Cấp Vật Liệu</label>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'all', label: 'Tất cả nguồn' },
              { value: 'consumed', label: 'Đã tiêu thụ' },
              { value: 'unconsumed', label: 'Chưa tiêu thụ' }
            ].map(opt => (
              <div
                key={opt.value}
                onClick={() => setFilterType(opt.value as any)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl border cursor-pointer text-sm font-bold transition-all duration-200 ${filterType === opt.value ? 'bg-[#5b4ce8] border-[#5b4ce8] text-white shadow-lg' : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-[#5b4ce8]'
                  }`}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row flex-wrap items-center gap-4">
          <Input
            prefix={<SearchOutlined className="text-gray-400 mr-1" />}
            placeholder="Tìm mã nguyên liệu..."
            value={ingredientSearch}
            onChange={(e) => setIngredientSearch(e.target.value)}
            className="w-full md:w-auto flex-1 min-w-[200px] rounded-xl h-12 border-gray-100 bg-gray-50/50"
            onPressEnter={() => { setActiveIngredientSearch(ingredientSearch); setActiveLotSearch(lotSearch); }}
          />
          <Input
            prefix={<NumberOutlined className="text-gray-400 mr-1" />}
            placeholder="Tìm số lô (Lot)..."
            value={lotSearch}
            onChange={(e) => setLotSearch(e.target.value)}
            className="w-full md:w-auto flex-1 min-w-[200px] rounded-xl h-12 border-gray-100 bg-gray-50/50"
            onPressEnter={() => { setActiveIngredientSearch(ingredientSearch); setActiveLotSearch(lotSearch); }}
          />
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              type="primary"
              className="bg-[#5b4ce8] border-[#5b4ce8] h-12 px-8 rounded-xl font-bold shadow-lg flex-1 md:flex-none"
              onClick={() => { setActiveIngredientSearch(ingredientSearch); setActiveLotSearch(lotSearch); }}
            >
              TÌM KIẾM
            </Button>
            <Button
              className="h-12 px-6 rounded-xl border-gray-200 text-gray-500 font-bold flex-1 md:flex-none"
              onClick={() => {
                setIngredientSearch('');
                setLotSearch('');
                setActiveIngredientSearch('');
                setActiveLotSearch('');
                onClearFilter?.();
              }}
            >
              XÓA LỌC
            </Button>
          </div>
          <div className="w-full md:w-auto md:ml-auto bg-gray-50 px-4 h-12 rounded-lg border border-gray-100 flex items-center justify-center gap-3">
            <div className="text-[10px] font-bold text-gray-400 uppercase leading-none tracking-wider">Kết quả</div>
            <div className="text-lg font-black text-[#5b4ce8] leading-none">{filteredData.length}</div>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          rowKey="ingredientCode"
          columns={columns}
          data={filteredData}
          isLoading={loading}
          hidePagination={true}
          className="material-flat-table"
        />
      </div>

      {/* Detailed Modal */}
      <MaterialDetailModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedItem(null); setSelectedGroup(null); }}
        order={order}
        batches={batches}
        ingredientsTotals={ingredientsTotals}
        selectedGroup={selectedGroup}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />
    </div>
  );
};

export default MaterialsTab;