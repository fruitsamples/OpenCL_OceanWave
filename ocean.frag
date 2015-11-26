// Version:    <1.0>
//
// Disclaimer: IMPORTANT:  This Apple software is supplied to you by Apple Inc. ("Apple")
//             in consideration of your agreement to the following terms, and your use,
//             installation, modification or redistribution of this Apple software
//             constitutes acceptance of these terms.  If you do not agree with these
//             terms, please do not use, install, modify or redistribute this Apple
//             software.
//
//             In consideration of your agreement to abide by the following terms, and
//             subject to these terms, Apple grants you a personal, non - exclusive
//             license, under Apple's copyrights in this original Apple software ( the
//             "Apple Software" ), to use, reproduce, modify and redistribute the Apple
//             Software, with or without modifications, in source and / or binary forms;
//             provided that if you redistribute the Apple Software in its entirety and
//             without modifications, you must retain this notice and the following text
//             and disclaimers in all such redistributions of the Apple Software. Neither
//             the name, trademarks, service marks or logos of Apple Inc. may be used to
//             endorse or promote products derived from the Apple Software without specific
//             prior written permission from Apple.  Except as expressly stated in this
//             notice, no other rights or licenses, express or implied, are granted by
//             Apple herein, including but not limited to any patent rights that may be
//             infringed by your derivative works or by other works in which the Apple
//             Software may be incorporated.
//
//             The Apple Software is provided by Apple on an "AS IS" basis.  APPLE MAKES NO
//             WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION THE IMPLIED
//             WARRANTIES OF NON - INFRINGEMENT, MERCHANTABILITY AND FITNESS FOR A
//             PARTICULAR PURPOSE, REGARDING THE APPLE SOFTWARE OR ITS USE AND OPERATION
//             ALONE OR IN COMBINATION WITH YOUR PRODUCTS.
//
//             IN NO EVENT SHALL APPLE BE LIABLE FOR ANY SPECIAL, INDIRECT, INCIDENTAL OR
//             CONSEQUENTIAL DAMAGES ( INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
//             SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
//             INTERRUPTION ) ARISING IN ANY WAY OUT OF THE USE, REPRODUCTION, MODIFICATION
//             AND / OR DISTRIBUTION OF THE APPLE SOFTWARE, HOWEVER CAUSED AND WHETHER
//             UNDER THEORY OF CONTRACT, TORT ( INCLUDING NEGLIGENCE ), STRICT LIABILITY OR
//             OTHERWISE, EVEN IF APPLE HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// Copyright ( C ) 2008 Apple Inc. All Rights Reserved.
//
////////////////////////////////////////////////////////////////////////////////////////////////////


uniform vec4 WaveConstants;
uniform vec4 CameraPosition;
uniform float Exposure;
uniform float SunAngle;

varying vec3 normal;
varying vec4 pos;
varying mat4 mv;
varying vec2 texcoord;
varying vec4 view;

const vec4 SunColor = vec4(251.0/255.0, 180.0/255.0, 90.0/255.0, 1.0);
const float SunPower = 1000.0;

const vec4 DownWaterColor = vec4(42.0/255.0, 56.0/255.0, 76.0/255.0,  1.0);
const vec4 UpWaterColor   = vec4(0.01, 0.02, 0.04, 1.0);

const vec4 SunPosition = vec4(50.0, 100.0, -250.0, 1.0);
const vec4 SunDirection = vec4(0.0, 300.0, -100.0, 1.0);
const vec4 SunIntensity = vec4(1.25, 1.25, 1.25, 1.0);
const float AtmosphereLengthBias = 1.0;

const float AirZenith = 8400.0;
const float AirHazeRatio = (1.25/8.4);
const float OuterRadius = (6378000.0+AirZenith);
const float InnerRadius = 6378000.0;

const vec4 RaleighCoefficients = vec4(4.1e-06,6.93327e-06,1.43768e-05, 1.0); 
const vec4 MieCoefficients = vec4(2.3e-06,2.3e-06,2.3e-06, 1.0);         
const float Eccentricty = -0.994;                                  

const float PI = 3.14159265358979323846;

void AerialPerspective(
	vec3 pos,
	vec3 camera,
	vec3 sun_dir,
    out vec3 extinction,
	out vec3 scatter,
	out vec3 sun_color)
{
    // force viewpoint close to the ground to avoid color shifts
    camera.z = min(camera.z, InnerRadius + (OuterRadius-InnerRadius) * 0.25);

    float s_air  = length(pos - camera);
    float s_haze = s_air * AirHazeRatio;

    vec3 extinction_air_haze = exp( - s_haze * (MieCoefficients.xyz + RaleighCoefficients.xyz) );
    vec3 extinction_air = exp( - (s_air-s_haze)  * RaleighCoefficients.xyz );

    vec3 view_dir = normalize(pos - camera);
    float cos_theta = dot(sun_dir, view_dir);

    vec3 raleigh_theta = (1.0 + cos_theta * cos_theta) * RaleighCoefficients.xyz * 3.0/(16.0*PI);

    vec3 mie_theta = 1.0/(4.0*PI) * MieCoefficients.xyz * (1.0 - (Eccentricty * Eccentricty)) *
                    pow(1.0 + (Eccentricty * Eccentricty) - (2.0 * Eccentricty * cos_theta), -3.0/2.0 );

    float cos_theta_sun = -sun_dir.z;
    float theta_sun = (180.0/PI)*acos(cos_theta_sun);

    float t_air = AirZenith / (cos_theta_sun + 0.15 * pow(93.885 - theta_sun, -1.253) );
    float t_haze = t_air * AirHazeRatio;
    
    sun_color = exp( - (RaleighCoefficients.xyz * t_air + MieCoefficients.xyz * t_haze)  );

    scatter = sun_color * SunIntensity.xyz *
              ( ((raleigh_theta + mie_theta) / (RaleighCoefficients.xyz + MieCoefficients.xyz)) * (1.0 - extinction_air_haze) +
              (raleigh_theta / RaleighCoefficients.xyz) * (1.0 - extinction_air) * extinction_air_haze);
    
    extinction = extinction_air * extinction_air_haze;
}

vec3 ToneMap(vec3 light, float exposure)
{
    return (1.0 - exp(- light * exposure));
}

vec3 GroundColorFromAtmosphere(
    vec3 pos,
    vec3 camera,
    vec3 sun_dir,
    vec3 ground_color,
    float exposure)
{
    vec3 extinction, scatter, sun_color;
    vec3 offset = vec3(0.0, 0.0, InnerRadius);

    AerialPerspective(pos + offset,
                      camera + offset,
                      sun_dir,
                      extinction, scatter, sun_color);

  return ToneMap( scatter + extinction * sun_color * (-sun_dir.z) * ground_color, exposure );
}

void main(void) 
{
    float WX = WaveConstants.x;
    float WY = WaveConstants.y;
    vec4 DX = vec4(WX/2.0, WY/2.0, 0.0, 1.0);

    vec2 st = texcoord;
    vec3 nn = normalize(normal);
    vec3 view_dir = normalize((CameraPosition - pos).xyz);
    vec3 reflect_dir = normalize(reflect(-view.xyz, nn));
    float sin_phi = reflect_dir.z;
    float vdn = dot(view_dir, nn);
    float l = (-InnerRadius * sin_phi) + sqrt( (InnerRadius * InnerRadius) * ((sin_phi * sin_phi) - 1.0) + OuterRadius * OuterRadius );
    vec3 aerial_pos = l * view.xyz;
    vec3 aerial_dir = normalize(vec3(SunDirection.x, SunAngle, SunDirection.z));
    vec4 water_color = mix(DownWaterColor, UpWaterColor, pow(clamp(vdn, 0.0, 1.0), 2.0));
    float c = clamp(vdn, 0.0, 1.0);
    float f = 0.0204 + 0.9796*pow(1.0 - c, 5.0 * c);

    vec4 combined_color = vec4(GroundColorFromAtmosphere(aerial_pos.xyz, vec3(0.0, 0.0, 0.0), aerial_dir.xyz, water_color.rgb * (f*f), Exposure), 1.0);
    
    vec4 light_vector = mv * SunPosition - pos;
    float e = abs(dot(normalize(light_vector.xz), normalize((mv * SunPosition).xz)));
    e = smoothstep(0.95, 1.0, e);
    vec4 sun_color = vec4(vec3(e*pow(clamp(dot(-reflect_dir, normalize(light_vector.xyz)), 0.0, 1.0), SunPower)), 1.0) * combined_color;

    gl_FragColor = combined_color + min(Exposure * 0.5, (SunAngle / 300.0) * f) * sun_color;

}
