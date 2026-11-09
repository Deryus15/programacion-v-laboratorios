package pa.ac.unachi.mvcestudiantes.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import pa.ac.unachi.mvcestudiantes.model.Estudiante;

public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {
    List<Estudiante> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(
            String nombre, String apellido);
}
