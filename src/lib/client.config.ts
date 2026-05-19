export const clientConfig = {
  businessName: 'Alma San Juan',
  botName: 'Giuli',
  address: 'Paula A. de Sarmiento 1085 Sur, Barrio Porres, San Juan',
  workingHours: {
    weekdays: { open: '09:30', close: '20:00', days: [1, 2, 3, 4, 5] },
    saturday: { open: '09:00', close: '17:00', days: [6] },
    sunday: false,
  },
  appointments: {
    enabled: true,
    botBooking: false,
    manualOnly: true,
    defaultDuration: 30,
    resources: ['Principal'],
    confirmationMode: 'manual' as 'manual' | 'auto',
  },
  ycloud: {
    phoneNumberId: '',
    apiKey: '',
    webhookSecret: '',
  },
  dashboard: {
    title: 'Alma San Juan',
    subtitle: 'Panel de gestión',
    footerText: 'Desarrollado por Feer',
    pinLogin: '1588',
  },
};
