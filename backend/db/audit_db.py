#Código para validar y comparar la respuesta de la IA respecto a la predicción de Inventario.
import mysql.connector
import pandas as pd
import numpy as np
import os
from dotenv import load_dotenv

# Cargar variables de entorno
dotenv_path = os.path.join(os.path.dirname(__file__), '../.env')
load_dotenv(dotenv_path)

# --- CONFIGURACIÓN ---
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'teillier_vetsync'),
    'port': int(os.getenv('DB_PORT', 3306))
}

# CORRECCIÓN 1: Ajustado a 90 días para coincidir con la IA
DIAS_ANALISIS = 90 
DIAS_COBERTURA = 30 

def get_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Error de conexión: {err}")
        return None

def auditar_inventario():
    conn = get_db_connection()
    if not conn: return

    try:
        print(f"Conectado a BD: {DB_CONFIG['database']}")
        print(f"Auditando últimos {DIAS_ANALISIS} días...")

        # 1. Obtener Items Activos
        query_items = "SELECT id, nombre, stock, stock_minimo FROM Inventario_Items WHERE id_clinica = 4 AND activo = 1"
        df_items = pd.read_sql(query_items, conn)
        
        # 2. Obtener Movimientos (Ventas, Consumo, Salidas Medicas)
        query_movs = f"""
            SELECT id_item, DATE(creado_en) as fecha, cantidad, tipo_movimiento
            FROM Movimientos_Inventario 
            WHERE tipo_movimiento IN ('VENTA', 'SALIDA_MEDICA', 'CONSUMO_INTERNO')
            AND id_clinica = 4
            AND creado_en >= DATE_SUB(NOW(), INTERVAL {DIAS_ANALISIS} DAY)
        """
        df_movs = pd.read_sql(query_movs, conn)
        



        print((f"Analizando {len(df_items)} items y {len(df_movs)} movimientos..."))
        print("-" * 100)

        reporte = []

        for _, item in df_items.iterrows():
            item_movs = df_movs[df_movs['id_item'] == item['id']]
            
            if item_movs.empty:
                consumo_diario = 0
                std_dev = 0
                dias_restantes = 999
                sugerencia = 0
                riesgo = "Sin Historia"
                
                # Aún sin historia, si está bajo el mínimo, debería alertar (Lógica básica)
                if item['stock'] < item['stock_minimo']:
                     sugerencia = item['stock_minimo'] - item['stock']
                     riesgo = "CRÍTICO (Sin Datos)"

            else:
                diario = item_movs.groupby('fecha')['cantidad'].sum()
                
                # CORRECCIÓN 2: Rango de fechas FIJO de 90 días
                # Esto evita inflar el promedio si el producto se vendió por primera vez hace poco
                fecha_inicio_analisis = pd.Timestamp.now().date() - pd.Timedelta(days=DIAS_ANALISIS)
                rango_completo = pd.date_range(start=fecha_inicio_analisis, end=pd.Timestamp.now().date())
                
                # Rellenamos con 0 los días que no hubo ventas en esos 90 días
                diario = diario.reindex(rango_completo, fill_value=0)
                
                consumo_diario = diario.mean()
                std_dev = diario.std()
                
                # Calcular Días Restantes
                if consumo_diario > 0.001:
                    dias_restantes = item['stock'] / consumo_diario
                else:
                    dias_restantes = 999
                    
                # Stock de Seguridad (95% confianza)
                stock_seguridad = 1.65 * std_dev
                
                # Demanda para cubrir X días
                demanda_objetivo = (consumo_diario * DIAS_COBERTURA) + stock_seguridad
                
                # CORRECCIÓN 3: Lógica de Sugerencia Mejorada
                # La meta es el mayor entre: (Lo que necesito para 30 días) O (Mi Stock Mínimo)
                meta_inventario = max(demanda_objetivo, item['stock_minimo'])
                
                # Si tengo menos de la meta, sugiero comprar la diferencia
                sugerencia = max(0, meta_inventario - item['stock'])
                
                # Evaluar Riesgo
                riesgo = "BAJO"
                if item['stock'] <= item['stock_minimo']:
                    riesgo = "CRÍTICO (Bajo Mínimo)"
                elif dias_restantes < 7:
                    riesgo = "ALTO (< 7 días)"
                elif dias_restantes < 15:
                    riesgo = "MEDIO (< 15 días)"
                    
            reporte.append({
                "ID": item['id'],
                "Item": item['nombre'][:25],
                "Stock": int(item['stock']),
                "Min": int(item['stock_minimo']),
                "Avg/Dia": round(consumo_diario, 2),
                "Dias Rest": round(dias_restantes, 1) if dias_restantes < 999 else ">999",
                "Sugerir": int(round(sugerencia, 0)),
                "Riesgo": riesgo
            })

        # Mostrar Tabla
        df_rep = pd.DataFrame(reporte)
        
        # Ordenar: Primero CRITICO
        prioridad = {
            "CRÍTICO (Bajo Mínimo)": 0, 
            "CRÍTICO (Sin Datos)": 0,
            "ALTO (< 7 días)": 1, 
            "MEDIO (< 15 días)": 2, 
            "BAJO": 3, 
            "Sin Historia": 4
        }
        df_rep['Prio'] = df_rep['Riesgo'].map(prioridad)
        df_rep = df_rep.sort_values('Prio').drop('Prio', axis=1)
        
        print(df_rep.to_string(index=False))

    except Exception as e:
        print(f"Error durante la auditoría: {e}")
    finally:
        if conn and conn.is_connected():
            conn.close()

if __name__ == "__main__":
    auditar_inventario()