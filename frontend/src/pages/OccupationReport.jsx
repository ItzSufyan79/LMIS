import ReportHeader from '../components/ReportHeader'
import KpiRow from '../components/KpiRow'
import TrendChart from '../components/TrendChart'
import ForecastCards from '../components/ForecastCards'
import EarlyWarning from '../components/EarlyWarning'
import { DemandBlock, SupplyFunnel } from '../components/DemandSupply'
import GapReasons from '../components/GapReasons'
import TrainingCapacity from '../components/TrainingCapacity'
import SkillsPanel from '../components/SkillsPanel'
import HiringActions from '../components/HiringActions'
import DataConfidence from '../components/DataConfidence'

export default function OccupationReport({ intel, onBack, onChange }) {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-5 py-6 md:h-full md:overflow-y-auto lg:px-8 lg:py-8">
      <ReportHeader intel={intel} onBack={onBack} />

      <KpiRow intel={intel} />
      <TrendChart intel={intel} />
      <ForecastCards intel={intel} onChange={onChange} />
      <EarlyWarning intel={intel} />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-12">
        <DemandBlock intel={intel} />
        <SupplyFunnel intel={intel} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-12">
        <GapReasons intel={intel} />
        <TrainingCapacity intel={intel} />
      </div>

      <HiringActions intel={intel} />
      <SkillsPanel intel={intel} />
      <DataConfidence intel={intel} />
    </div>
  )
}