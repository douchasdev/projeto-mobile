
import { NativeTabs } from "expo-router/unstable-native-tabs";

import { ActivitiesProvider } from "../../contexts/ActivitiesContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <ActivitiesProvider>
      <NativeTabs
        labelVisibilityMode="labeled"
        backgroundColor={colors.surface}
        tintColor={colors.primary}
        iconColor={{
          default: colors.textSecondary,
          selected: colors.primary,
        }}
        labelStyle={{
          color: colors.text,
        }}
        indicatorColor={colors.surfaceAlt}
      >
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
