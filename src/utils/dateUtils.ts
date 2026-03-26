import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

// Configurar dayjs con español y plugin de tiempo relativo
dayjs.extend(relativeTime);
dayjs.locale('es');

/**
 * Humaniza una fecha mostrándola de forma relativa (ej: "hace 2 días")
 * @param fecha - Fecha en formato string o Date
 * @param conHora - Si es true, incluye la hora en formato legible
 * @returns Fecha humanizada
 */
export const humanizarFecha = (fecha: string | Date, conHora = false): string => {
  const fechaDayjs = dayjs(fecha);
  const ahora = dayjs();
  const diferenciaDias = ahora.diff(fechaDayjs, 'day');

  // Si es hoy
  if (diferenciaDias === 0) {
    if (conHora) {
      return `Hoy a las ${fechaDayjs.format('HH:mm')}`;
    }
    return 'Hoy';
  }

  // Si fue ayer
  if (diferenciaDias === 1) {
    if (conHora) {
      return `Ayer a las ${fechaDayjs.format('HH:mm')}`;
    }
    return 'Ayer';
  }

  // Si es dentro de la última semana
  if (diferenciaDias < 7) {
    return fechaDayjs.fromNow(); // "hace 3 días"
  }

  // Si es del mes actual
  if (fechaDayjs.isSame(ahora, 'month')) {
    if (conHora) {
      return fechaDayjs.format('D [de] MMMM [a las] HH:mm');
    }
    return fechaDayjs.format('D [de] MMMM');
  }

  // Si es del año actual
  if (fechaDayjs.isSame(ahora, 'year')) {
    if (conHora) {
      return fechaDayjs.format('D [de] MMMM [a las] HH:mm');
    }
    return fechaDayjs.format('D [de] MMMM');
  }

  // Si es de años anteriores
  if (conHora) {
    return fechaDayjs.format('D [de] MMMM [de] YYYY [a las] HH:mm');
  }
  return fechaDayjs.format('D [de] MMMM [de] YYYY');
};

/**
 * Formatea una fecha en formato corto legible (ej: "15 Mar 2026")
 * @param fecha - Fecha en formato string o Date
 * @returns Fecha formateada
 */
export const formatearFechaCorta = (fecha: string | Date): string => {
  return dayjs(fecha).format('D MMM YYYY');
};

/**
 * Formatea una fecha completa con hora (ej: "15 de marzo de 2026, 14:30")
 * @param fecha - Fecha en formato string o Date
 * @returns Fecha formateada
 */
export const formatearFechaCompleta = (fecha: string | Date): string => {
  return dayjs(fecha).format('D [de] MMMM [de] YYYY, HH:mm');
};
