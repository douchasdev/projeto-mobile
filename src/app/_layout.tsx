import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { ActivitiesProvider } from '../contexts/ActivitiesContext';

export default function TabLayout() {
  return (
    <ActivitiesProvider>
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>
            Home
          </NativeTabs.Trigger.Label>

          <NativeTabs.Trigger.Icon
            sf="house.fill"
            md="home"
          />
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