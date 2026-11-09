package pa.ac.unachi.mvcestudiantes.service;

import java.util.List;
import org.springframework.stereotype.Service;
import pa.ac.unachi.mvcestudiantes.model.Estudiante;
import pa.ac.unachi.mvcestudiantes.repository.EstudianteRepository;

@Service
public class EstudianteService {

    private final EstudianteRepository repository;

    public EstudianteService(EstudianteRepository repository) {
        this.repository = repository;
    }

    public List<Estudiante> listar(String buscar) {
        if (buscar == null || buscar.isBlank()) {
            return repository.findAll();
        }
        return repository.findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(
                buscar, buscar);
    }

    public Estudiante buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe el estudiante con id " + id));
    }

    public Estudiante guardar(Estudiante estudiante) {
        return repository.save(estudiante);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}
