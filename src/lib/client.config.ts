export const clientConfig = {
  name: "Alma San Juan",
  businessName: "Alma San Juan",
  businessDescription: "Centro especializado en Depilación Láser en San Juan",
  behavior: "amable, simpática y dulce",
  slogan: "",
  address: "Paula A. de Sarmiento 1085 Sur, Barrio Porres, San Juan",
  phone: "",

  hours: {
    monday:    { open: "09:30", close: "20:00" },
    tuesday:   { open: "09:30", close: "20:00" },
    wednesday: { open: "09:30", close: "20:00" },
    thursday:  { open: "09:30", close: "20:00" },
    friday:    { open: "09:30", close: "20:00" },
    saturday:  { open: "09:00", close: "17:00" },
    sunday:    null,
  },

  services: [] as Array<{ id?: string; name: string; description?: string; price: number; duration?: number }>,

  botName: "Giuli",
  botBooking: false,
  appointmentDuration: 30,
  loginPin: "1588",

  responseDelayMs: 8000,
  appointments: {
    enabled: true,
    resource: "Principal",
  },
};
