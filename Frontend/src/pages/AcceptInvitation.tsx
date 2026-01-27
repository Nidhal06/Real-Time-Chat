import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import {
  Shell,
  Backdrop,
  Card,
  InviteMeta,
  ErrorMessage,
  InviteBadge,
  StatusRow,
  StatusDot,
  MutedNote,
} from "./AcceptInvitation.styles";

type InvitationSummary = {
  id: string;
  roomId: string;
  roomName: string;
  email: string;
  status: "pending" | "accepted";
  createdBy: { id: string; name: string; email: string };
  createdAt: string;
  acceptedAt: string | null;
};

type InvitationResponse = {
  invitation: InvitationSummary;
};

type AcceptResponse = {
  invitation: InvitationSummary;
  roomId: string;
  roomName: string;
};

const AcceptInvitation = (): JSX.Element => {
  const { token } = useParams<{ token: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<InvitationSummary | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const acceptanceStartedRef = useRef(false);
  const redirectTriggeredRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setFetchError("Invitation token missing");
      setLoadingInvitation(false);
      return;
    }

    let mounted = true;
    setLoadingInvitation(true);
    setFetchError(null);

    axiosClient
      .get<InvitationResponse>(`/invitations/${token}`)
      .then(({ data }) => {
        if (!mounted) {
          return;
        }
        if (data.invitation.status !== "pending") {
          setFetchError("This invitation has already been used or expired.");
          return;
        }
        setInvitation(data.invitation);
      })
      .catch((error) => {
        const message =
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message ?? "Unable to load invitation";
        if (mounted) {
          setFetchError(message);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingInvitation(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (authLoading || redirectTriggeredRef.current) {
      return;
    }

    if (!user && invitation && !fetchError) {
      redirectTriggeredRef.current = true;
      navigate("/login", {
        replace: true,
        state: { redirectTo: `/invite/accept/${token}` },
      });
    }
  }, [authLoading, user, invitation, fetchError, navigate, token]);

  useEffect(() => {
    if (
      authLoading ||
      !user ||
      !invitation ||
      fetchError ||
      acceptanceStartedRef.current ||
      accepting
    ) {
      return;
    }

    acceptanceStartedRef.current = true;
    setAccepting(true);
    setAcceptError(null);

    axiosClient
      .post<AcceptResponse>(`/invitations/${token}/accept`)
      .then(({ data }) => {
        navigate(`/rooms/${data.roomId}`, { replace: true });
      })
      .catch((error) => {
        const message =
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message ?? "Failed to accept invitation";
        setAcceptError(message);
        setAccepting(false);
      });
  }, [authLoading, user, invitation, fetchError, accepting, navigate, token]);

  const renderContent = (): JSX.Element => {
    if (loadingInvitation) {
      return <p>Validating your invitation…</p>;
    }

    if (fetchError) {
      return <ErrorMessage>{fetchError}</ErrorMessage>;
    }

    if (!user) {
      return <p>Redirecting to sign in…</p>;
    }

    if (acceptError) {
      return <ErrorMessage>{acceptError}</ErrorMessage>;
    }

    return (
      <div>
        <p>
          Hi {user.name}, finishing your access to {invitation?.roomName}…
        </p>
        {accepting ? <p>Granting access without password…</p> : null}
      </div>
    );
  };

  return (
    <Shell>
      <Backdrop aria-hidden="true" />
      <Card>
        <InviteBadge>Private invite</InviteBadge>
        <h1>Unlock {invitation?.roomName ?? "a private room"}</h1>
        {invitation ? (
          <InviteMeta>
            <span>Room: {invitation.roomName}</span>
            <span>Invited as: {invitation.email}</span>
          </InviteMeta>
        ) : null}
        <StatusRow>
          <StatusDot $active={!fetchError && Boolean(invitation)} />
          <strong>
            {fetchError ? "Invitation on hold" : "Verifying secure token"}
          </strong>
        </StatusRow>
        {renderContent()}
        <MutedNote>Invitations auto-expire after 48 hours.</MutedNote>
      </Card>
    </Shell>
  );
};

export default AcceptInvitation;
