#include "GCS.h"
#include <iostream>
#include <vector>

using namespace GCS;

auto sys = new System();

int main() {

    VEC_pD params;
    VEC_pD solved_params;

    Point p1;
    p1.x = new double(1);
    p1.y = new double(2);
    params.push_back(p1.x);
    params.push_back(p1.y);

    Point p2;
    p2.x = new double(10);
    p2.y = new double(0);
    params.push_back(p2.x);
    params.push_back(p2.y);

    Line l1;
    l1.p1 = p1;
    l1.p2 = p2;

    Point p3;
    p3.x = new double(10);
    p3.y = new double(5);
    params.push_back(p3.x);
    params.push_back(p3.y);

    Point p4;
    p4.x = new double(15);
    p4.y = new double(5);
    params.push_back(p4.x);
    params.push_back(p4.y);

    Arc a1;
    a1.start = p2;
    a1.center = p3;
    a1.end = p4;
    a1.rad = new double(5);
    a1.startAngle = new double(-M_PI / 2);
    a1.endAngle = new double(0);
    params.push_back(a1.rad);
    params.push_back(a1.startAngle);
    params.push_back(a1.endAngle);

    double *distance = new double(100);
    params.push_back(distance);

    double *radius = new double(10);
    params.push_back(radius);

    solved_params.push_back(p1.x);
    solved_params.push_back(p1.y);
    solved_params.push_back(p3.x);
    solved_params.push_back(p3.y);
    solved_params.push_back(p4.x);
    solved_params.push_back(p4.y);
    solved_params.push_back(a1.rad);
    solved_params.push_back(a1.startAngle);
    solved_params.push_back(a1.endAngle);

    sys->addConstraintHorizontal(l1, 1);
    sys->addConstraintDifference(p1.x, p2.x, distance, 2); // horizontal length

    sys->addConstraintArcRules(a1, 4);
    sys->addConstraintArcRadius(a1, radius, 5);
    
    sys->addConstraintTangent(l1, a1, 6);
    
    sys->debugMode = IterationLevel;
    int sys_ret = sys->solve(solved_params);

    VEC_I conflicting_tags;

    sys->getConflicting(conflicting_tags);

    std::cout << "Status: " << (sys_ret == Success) << std::endl;
    std::cout << "Has conflicting: " << sys->hasConflicting() << std::endl;
    std::cout << "DOF: " << sys->dofsNumber() << std::endl;

    sys->applySolution();

    for (int i = 0; i < params.size(); ++i) {
        std::cout << *params[i] << std::endl;
    }
    delete sys;

    return 0;
}
