-- supabase/migrations/002_conditions_table.sql
-- Ejecutar en Supabase SQL Editor

-- ─── TABLA: conditions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conditions (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code                TEXT UNIQUE NOT NULL,
  name                TEXT NOT NULL,
  description         TEXT NOT NULL,
  risk_level          TEXT NOT NULL,
  is_urgent           BOOLEAN DEFAULT FALSE,
  recommendations     TEXT[] DEFAULT '{}',
  avoid               TEXT[] DEFAULT '{}',
  when_to_see_doctor  TEXT NOT NULL,
  specialist          TEXT DEFAULT 'Dermatólogo',
  self_care           TEXT[] DEFAULT '{}',
  warning_signs       TEXT[] DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer las condiciones
CREATE POLICY "conditions_select_authenticated"
  ON public.conditions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Solo service_role puede insertar/editar
CREATE POLICY "conditions_insert_service"
  ON public.conditions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ─── ÍNDICE ───────────────────────────────────────────────────────────────
CREATE INDEX idx_conditions_code ON public.conditions(code);

-- ─── DATOS: Las 7 condiciones del modelo ─────────────────────────────────

-- 1. QUERATOSIS ACTÍNICA (akiec)
INSERT INTO public.conditions (
  code, name, description, risk_level, is_urgent,
  recommendations, avoid, when_to_see_doctor, specialist, self_care, warning_signs
) VALUES (
  'akiec',
  'Queratosis Actínica',
  'La queratosis actínica es una lesión cutánea pre-maligna causada por la exposición crónica a los rayos UV del sol. Se presenta como parches rugosos, escamosos o costrosos en zonas expuestas al sol como cara, orejas, cuero cabelludo, cuello, manos y antebrazos. Aunque es benigna en su etapa inicial, tiene potencial de convertirse en carcinoma de células escamosas si no se trata.',
  'PRE-MALIGNO — Requiere atención médica',
  TRUE,
  ARRAY[
    'Consulta con un dermatólogo en los próximos 7 días para evaluación y tratamiento',
    'Aplica protector solar SPF 50+ todos los días, incluso en días nublados',
    'Usa ropa protectora: manga larga, sombrero de ala ancha y lentes UV',
    'Evita la exposición solar entre las 10am y las 4pm',
    'Reporta cualquier cambio en tamaño, color o textura de la lesión',
    'Realiza autoexámenes mensuales de tu piel en busca de nuevas lesiones'
  ],
  ARRAY[
    'Exposición solar sin protección, especialmente entre 10am y 4pm',
    'Camas de bronceado y lámparas UV',
    'Rascar o frotar la lesión — puede irritarse e infectarse',
    'Aplicar remedios caseros sin supervisión médica',
    'Ignorar cambios en la lesión'
  ],
  'Acude al dermatólogo dentro de los próximos 7 días. Si la lesión crece rápidamente, sangra, forma úlcera o cambia de color, acude de inmediato a urgencias.',
  'Dermatólogo / Dermatólogo oncólogo',
  ARRAY[
    'Mantén la zona limpia y sin rascar',
    'Hidrata la piel alrededor de la lesión con crema sin fragancia',
    'Documenta la lesión con fotografías semanales para mostrar al médico',
    'Usa sombrero y manga larga cuando salgas al exterior'
  ],
  ARRAY[
    'La lesión crece rápidamente en días o semanas',
    'Aparece sangrado espontáneo o al roce mínimo',
    'Se forma una úlcera o costra que no cicatriza',
    'La lesión se endurece notablemente',
    'Aparecen nuevas lesiones similares en poco tiempo'
  ]
);

-- 2. MELANOMA (mel)
INSERT INTO public.conditions (
  code, name, description, risk_level, is_urgent,
  recommendations, avoid, when_to_see_doctor, specialist, self_care, warning_signs
) VALUES (
  'mel',
  'Melanoma',
  'El melanoma es el tipo más peligroso de cáncer de piel. Se origina en los melanocitos, las células productoras de pigmento. Puede aparecer como un lunar nuevo o como cambios en un lunar existente. Sigue la regla ABCDE: Asimetría, Bordes irregulares, Color no uniforme, Diámetro mayor a 6mm, Evolución o cambio. Es curable en etapas tempranas pero puede ser mortal si se detecta tarde.',
  'MALIGNO — Atención urgente requerida',
  TRUE,
  ARRAY[
    '🚨 Busca atención médica HOY — el melanoma detectado temprano tiene alta tasa de curación',
    'No toques, rasques ni cubras la lesión con vendajes sin indicación médica',
    'Documenta la lesión con fotografías antes de la consulta',
    'Aplica protector solar SPF 50+ en todo el cuerpo diariamente',
    'Informa a tus familiares — el melanoma tiene componente genético',
    'Evita cualquier exposición solar hasta ser evaluado por un especialista'
  ],
  ARRAY[
    'Cualquier exposición solar sin protección total',
    'Camas de bronceado — aumentan significativamente el riesgo',
    'Rascar, frotar o intentar extirpar la lesión en casa',
    'Demorar la consulta médica — cada día cuenta en melanoma',
    'Automedicación con cremas o remedios caseros'
  ],
  'URGENTE — Acude a un dermatólogo u oncólogo HOY MISMO. Si no puedes conseguir cita inmediata, ve a urgencias de un hospital con servicio de dermatología.',
  'Dermatólogo oncólogo / Oncólogo',
  ARRAY[
    'No manipules la lesión bajo ninguna circunstancia',
    'Cubre la lesión con ropa (no vendajes) para protegerla del sol',
    'Anota la fecha en que notaste el primer cambio para informar al médico',
    'Lleva un registro fotográfico de la lesión desde hoy'
  ],
  ARRAY[
    'Cualquier cambio en tamaño, forma o color en días',
    'Sangrado sin causa aparente',
    'Picazón, ardor o dolor persistente en la lesión',
    'Bordes que se vuelven irregulares o difusos',
    'La lesión supera 6mm de diámetro',
    'Aparición de nódulos o protuberancias alrededor'
  ]
);

-- 3. CARCINOMA BASOCELULAR (bcc)
INSERT INTO public.conditions (
  code, name, description, risk_level, is_urgent,
  recommendations, avoid, when_to_see_doctor, specialist, self_care, warning_signs
) VALUES (
  'bcc',
  'Carcinoma Basocelular',
  'El carcinoma basocelular es el tipo más común de cáncer de piel. Se origina en las células basales de la epidermis y generalmente aparece en zonas expuestas al sol como cara, cuello y manos. Aunque raramente hace metástasis, crece localmente y puede destruir tejidos cercanos si no se trata. Se presenta como un nódulo perlado, una llaga que no cicatriza, o una zona plana y cicatricial.',
  'MALIGNO — Requiere tratamiento médico',
  TRUE,
  ARRAY[
    'Agenda cita con dermatólogo esta semana para biopsia y plan de tratamiento',
    'Aplica protector solar SPF 50+ diariamente en todas las zonas expuestas',
    'Usa ropa de protección solar UPF 50+, sombrero y lentes de sol',
    'No expongas la lesión al sol hasta recibir tratamiento',
    'Realiza autoexámenes mensuales en todo el cuerpo',
    'El tratamiento temprano tiene tasa de curación mayor al 95%'
  ],
  ARRAY[
    'Exposición solar sin protección adecuada',
    'Camas de bronceado y fuentes de luz UV artificial',
    'Rascar o intentar extirpar la lesión en casa',
    'Ignorar llagas que no cicatrizan en más de 3 semanas',
    'Aplicar cremas sin prescripción médica sobre la lesión'
  ],
  'Acude al dermatólogo dentro de los próximos 5-7 días. Si la lesión sangra frecuentemente o crece visiblemente en días, ve antes.',
  'Dermatólogo / Cirujano dermatólogo',
  ARRAY[
    'Limpia suavemente la zona con agua y jabón neutro',
    'No apliques presión sobre la lesión',
    'Protege la zona del sol con ropa cuando salgas',
    'Documenta con fotos semanalmente para comparar'
  ],
  ARRAY[
    'Llaga o herida que no cicatriza después de 3 semanas',
    'Sangrado recurrente sin trauma aparente',
    'Crecimiento visible en días o semanas',
    'Cambio de color hacia rosado perlado o translúcido',
    'Formación de costra que regresa repetidamente'
  ]
);

-- 4. LESIÓN QUERATÓSICA BENIGNA (bkl)
INSERT INTO public.conditions (
  code, name, description, risk_level, is_urgent,
  recommendations, avoid, when_to_see_doctor, specialist, self_care, warning_signs
) VALUES (
  'bkl',
  'Lesión Queratósica Benigna',
  'Las lesiones queratósicas benignas incluyen la queratosis seborreica y otras lesiones epidérmicas no cancerosas. Son muy comunes en adultos mayores de 40 años y aparecen como manchas o crecimientos marrones, negros o amarillos de apariencia "pegada" a la piel. Son completamente benignas y no requieren tratamiento médico salvo por razones estéticas o si causan molestias.',
  'BENIGNO — Sin riesgo de malignidad',
  FALSE,
  ARRAY[
    'No requiere tratamiento urgente — es una lesión benigna',
    'Consulta con un dermatólogo si deseas eliminarla por razones estéticas',
    'Aplica protector solar SPF 30+ para prevenir nuevas lesiones',
    'Hidrata la piel diariamente para mantenerla saludable',
    'Realiza autoexámenes periódicos para detectar cambios',
    'Si aparecen muchas lesiones nuevas en poco tiempo, consulta al médico'
  ],
  ARRAY[
    'Rascar o intentar remover la lesión en casa — puede infectarse',
    'Aplicar ácidos o remedios caseros para "quitarla"',
    'Exponerse al sol sin protección — favorece la aparición de nuevas lesiones'
  ],
  'No es urgente. Consulta al dermatólogo si la lesión cambia de aspecto, duele, sangra, o si deseas eliminarla por razones estéticas. Si aparecen muchas lesiones nuevas súbitamente (signo de Leser-Trélat), consulta pronto.',
  'Dermatólogo',
  ARRAY[
    'Hidrata la zona con crema sin fragancia',
    'Aplica protector solar diariamente',
    'No rasques ni intentens remover la lesión',
    'Documenta con fotos para comparar en el tiempo'
  ],
  ARRAY[
    'La lesión cambia rápidamente de tamaño o color',
    'Aparece sangrado o dolor',
    'Múltiples lesiones nuevas en poco tiempo',
    'La lesión se inflama o presenta signos de infección'
  ]
);

-- 5. DERMATOFIBROMA (df)
INSERT INTO public.conditions (
  code, name, description, risk_level, is_urgent,
  recommendations, avoid, when_to_see_doctor, specialist, self_care, warning_signs
) VALUES (
  'df',
  'Dermatofibroma',
  'El dermatofibroma es un nódulo cutáneo benigno y muy común, especialmente en las piernas. Aparece como un pequeño bulto duro de color marrón o rosado, que típicamente se "hunde" al pellizcarlo (signo del hoyuelo). Generalmente es asintomático aunque puede ser levemente sensible al tacto. Su causa exacta se desconoce pero puede estar relacionado con picaduras de insectos o pequeños traumas cutáneos.',
  'BENIGNO — Sin riesgo de malignidad',
  FALSE,
  ARRAY[
    'No requiere tratamiento — es completamente benigno',
    'Si te molesta estéticamente, un dermatólogo puede extirparlo',
    'Hidrata la zona regularmente',
    'Aplica protector solar si está en zona expuesta',
    'Realiza autoexámenes para verificar que no cambie'
  ],
  ARRAY[
    'Intentar extirparlo en casa — puede infectarse',
    'Rascar o manipular repetidamente la lesión',
    'Preocuparte — es una lesión completamente benigna'
  ],
  'No es urgente. Consulta al dermatólogo solo si la lesión crece rápidamente, duele intensamente, sangra o cambia de aspecto notablemente.',
  'Dermatólogo',
  ARRAY[
    'No requiere cuidados especiales',
    'Hidrata la zona si está en zona seca',
    'Protege del sol si está expuesto',
    'Observa periódicamente que no cambie'
  ],
  ARRAY[
    'Crecimiento rápido en semanas',
    'Sangrado espontáneo',
    'Dolor intenso o pulsátil',
    'Cambio notable de color (más oscuro o más claro)',
    'Inflamación o enrojecimiento alrededor'
  ]
);

-- 6. NEVUS MELANOCÍTICO / LUNAR (nv)
INSERT INTO public.conditions (
  code, name, description, risk_level, is_urgent,
  recommendations, avoid, when_to_see_doctor, specialist, self_care, warning_signs
) VALUES (
  'nv',
  'Nevus Melanocítico (Lunar)',
  'Un nevus melanocítico, comúnmente conocido como lunar, es un crecimiento benigno de melanocitos en la piel. La mayoría de los lunares son completamente normales y no representan ningún riesgo. Sin embargo, deben monitorearse con la regla ABCDE: Asimetría, Bordes, Color, Diámetro y Evolución. Los lunares que cambian merecen evaluación médica para descartar transformación maligna.',
  'BENIGNO — Monitoreo regular recomendado',
  FALSE,
  ARRAY[
    'Monitorea el lunar mensualmente con la regla ABCDE',
    'Aplica protector solar SPF 30+ diariamente sobre y alrededor del lunar',
    'Fotografía el lunar cada mes para comparar cambios',
    'Acude a revisión dermatológica anual si tienes muchos lunares',
    'Si tienes antecedentes familiares de melanoma, revisión semestral',
    'Usa ropa protectora para cubrir lunares expuestos al sol'
  ],
  ARRAY[
    'Exposición solar sin protección — el sol puede alterar los lunares',
    'Camas de bronceado — aumentan riesgo de transformación maligna',
    'Rascar, frotar o intentar quitar el lunar en casa',
    'Ignorar cambios en el aspecto del lunar'
  ],
  'Consulta al dermatólogo si el lunar cumple cualquiera de los criterios ABCDE: es Asimétrico, tiene Bordes irregulares, Color no uniforme, Diámetro mayor a 6mm, o ha Evolucionado/cambiado. Revisión anual recomendada de forma preventiva.',
  'Dermatólogo',
  ARRAY[
    'Aplica protector solar sobre el lunar diariamente',
    'Fotografíalo mensualmente siempre con la misma iluminación',
    'No lo rasques ni frotes con ropa ajustada',
    'Aprende la regla ABCDE y aplícala en tus autoexámenes'
  ],
  ARRAY[
    'Asimetría — una mitad no coincide con la otra',
    'Bordes irregulares, dentados o mal definidos',
    'Color no uniforme (mezcla de marrón, negro, rojo, blanco)',
    'Diámetro mayor a 6mm (del tamaño de un borrador)',
    'Evolución — cualquier cambio en semanas o meses',
    'Picazón, ardor o sangrado'
  ]
);

-- 7. LESIÓN VASCULAR (vasc)
INSERT INTO public.conditions (
  code, name, description, risk_level, is_urgent,
  recommendations, avoid, when_to_see_doctor, specialist, self_care, warning_signs
) VALUES (
  'vasc',
  'Lesión Vascular',
  'Las lesiones vasculares de la piel incluyen condiciones como el angioma cereza, la telangiectasia (arañas vasculares), el granuloma piogénico y los hemangiomas. Son causadas por anomalías en los vasos sanguíneos de la piel. La mayoría son completamente benignas, aunque algunas pueden sangrar fácilmente. El granuloma piogénico, en particular, tiende a sangrar abundantemente ante el menor trauma.',
  'BENIGNO — Generalmente sin riesgo',
  FALSE,
  ARRAY[
    'La mayoría de lesiones vasculares son benignas y no requieren tratamiento urgente',
    'Si sangra frecuentemente, consulta al dermatólogo para cauterización o extirpación',
    'Protege la lesión de roces y traumas para evitar sangrado',
    'Aplica protector solar si está en zona expuesta',
    'Mantén un registro fotográfico para monitorear cambios',
    'Consulta si tienes muchas lesiones nuevas en poco tiempo'
  ],
  ARRAY[
    'Rascar, frotar o traumatizar la lesión — sangra fácilmente',
    'Intentar extirparla en casa',
    'Aplicar presión fuerte sobre la lesión',
    'Ignorar sangrado frecuente sin causa aparente'
  ],
  'Consulta al dermatólogo si la lesión sangra frecuentemente, crece rápidamente, duele o multiplica. En caso de sangrado que no se detiene con presión directa en 15 minutos, acude a urgencias.',
  'Dermatólogo / Dermatólogo vascular',
  ARRAY[
    'Protege la lesión de golpes y roces con ropa o apósito suave',
    'Si sangra, aplica presión suave con gasa limpia durante 10-15 minutos',
    'Mantén la zona limpia e hidratada',
    'Evita actividades que puedan traumatizar la zona'
  ],
  ARRAY[
    'Sangrado abundante o que no cede con presión en 15 minutos',
    'Crecimiento rápido en días o semanas',
    'Cambio de color intenso o aparición de zonas oscuras',
    'Dolor intenso o pulsátil',
    'Múltiples lesiones nuevas en poco tiempo'
  ]
);

-- ─── VERIFICAR INSERCIÓN ──────────────────────────────────────────────────
SELECT code, name, risk_level, is_urgent FROM public.conditions ORDER BY is_urgent DESC, name;
