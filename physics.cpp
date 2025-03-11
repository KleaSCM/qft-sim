
#include <emscripten.h>
#include <cmath>
#include <cstdlib>

extern "C" {
EMSCRIPTEN_KEEPALIVE
double simulate_double_slit(double slit1, double slit2, double screen_x, double t, double k) {
    double d1 = fabs(screen_x - slit1);
    double d2 = fabs(screen_x - slit2);
    const double epsilon = 1e-6;
    double amplitude1 = exp(-d1 * d1 / (2 * t)) * cos(k * d1) / (d1 + epsilon);
    double amplitude2 = exp(-d2 * d2 / (2 * t)) * cos(k * d2) / (d2 + epsilon);
    double totalAmplitude = amplitude1 + amplitude2;
    double intensity = totalAmplitude * totalAmplitude;
    return intensity;
}

} // extern "C"

// Dummy main to satisfy the linker
extern "C" int main() { 
  return 0; 
}
