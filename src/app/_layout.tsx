
import { NativeTabs } from "expo-router/unstable-native-tabs";

import { ActivitiesProvider } from "../contexts/ActivitiesContext";

export default function TabLayout() {
  return (
    <ActivitiesProvider>
      <NativeTabs labelVisibilityMode="labeled">
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon
            sf="house.fill"
            md="home"
          />
          <NativeTabs.Trigger.Label>
            Home
          </NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="create">
          <NativeTabs.Trigger.Icon
            sf="plus"
            md="add"
          />
          <NativeTabs.Trigger.Label>
            Criar
          </NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="my-activities">
          <NativeTabs.Trigger.Icon
            sf="list.bullet"
            md="list"
          />
          <NativeTabs.Trigger.Label>
            Minhas
          </NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Icon
            sf="person"
            md="person"
          />
          <NativeTabs.Trigger.Label>
            Perfil
          </NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </ActivitiesProvider>
  );
}
