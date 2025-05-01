import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Update assessment to publish or unpublish results
export async function PATCH(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { resultsPublished } = await req.json();

    // Verify that the requester is the creator of the assessment
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: params.assessmentId,
        createdById: userId,
      },
    });

    if (!assessment) {
      return new NextResponse("Assessment not found or not authorized", { status: 404 });
    }

    // Update the assessment's resultsPublished status
    const updatedAssessment = await prisma.assessment.update({
      where: {
        id: params.assessmentId,
      },
      data: {
        resultsPublished,
      },
    });

    return NextResponse.json(updatedAssessment);
  } catch (error) {
    console.log("[ASSESSMENT_PUBLISH_RESULTS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 