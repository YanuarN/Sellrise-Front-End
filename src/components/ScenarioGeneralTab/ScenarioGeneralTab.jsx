import { FileText } from 'lucide-react';
import ScenarioSectionCard from '../ScenarioSectionCard';
import ScenarioField from '../ScenarioField';
import { SCENARIO_CONFIG_INPUT_CLS } from '../scenarioConfigStyles';

export default function ScenarioGeneralTab({
  name,
  setName,
  description,
  setDescription,
  version,
  setVersion,
}) {
  return (
    <div className="space-y-5">
      <ScenarioSectionCard title="Scenario Details" icon={FileText}>
        <div className="space-y-4">
          <ScenarioField label="Scenario Name *">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={SCENARIO_CONFIG_INPUT_CLS}
              placeholder="e.g. Lead Qualification Flow"
            />
          </ScenarioField>
          <ScenarioField label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${SCENARIO_CONFIG_INPUT_CLS} resize-none h-24`}
              placeholder="Describe the purpose of this scenario..."
            />
          </ScenarioField>
          <ScenarioField label="Version">
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className={`${SCENARIO_CONFIG_INPUT_CLS} w-32`}
              placeholder="1.0"
            />
          </ScenarioField>
        </div>
      </ScenarioSectionCard>
    </div>
  );
}
