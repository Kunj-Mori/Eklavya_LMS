import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if viewing published assessment or own assessment
    const user = await currentUser();
    const isInstructor = user?.publicMetadata?.role === "instructor";
    
    let assessment;
    
    if (isInstructor) {
      // Instructors can view their own assessments
      assessment = await prisma.assessment.findUnique({
        where: {
          id: params.assessmentId,
          createdById: userId,
        },
      });
    } else {
      // Students can only view published assessments
      assessment = await prisma.assessment.findUnique({
        where: {
          id: params.assessmentId,
          isPublished: true,
        },
      });
    }

    if (!assessment) {
      return new NextResponse("Assessment not found", { status: 404 });
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.log("[ASSESSMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { userId } = auth();
    const { isPublished } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const assessment = await db.assessment.findUnique({
      where: {
        id: params.assessmentId,
        createdById: userId,
      },
    });

    if (!assessment) {
      return new NextResponse("Not found", { status: 404 });
    }

    const updatedAssessment = await db.assessment.update({
      where: {
        id: params.assessmentId,
      },
      data: {
        isPublished,
      },
    });

    return NextResponse.json(updatedAssessment);
  } catch (error) {
    console.log("[ASSESSMENT_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const assessment = await db.assessment.findUnique({
      where: {
        id: params.assessmentId,
        createdById: userId,
      },
    });

    if (!assessment) {
      return new NextResponse("Not found", { status: 404 });
    }

    const deletedAssessment = await db.assessment.delete({
      where: {
        id: params.assessmentId,
      },
    });

    return NextResponse.json(deletedAssessment);
  } catch (error) {
    console.log("[ASSESSMENT_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 